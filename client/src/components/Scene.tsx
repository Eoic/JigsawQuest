import Cursor from './Cursor';
import { Viewport } from 'pixi-viewport';
import { Application, Container, Graphics } from 'pixi.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSceneStore, useWebSocketStore } from '../store';
import { ServerMessage } from '../types/webSocket';

const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 1000;

export const Scene = () => {
  const sceneRootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const { sendMessage, connection } = useWebSocketStore();
  const { users, addUser, removeUser, updateUserCursor } = useSceneStore();
  const [positionNotifyInterval, setPositionNotifyInterval] = useState<number | undefined>(undefined);
  const currentPoint = useRef({ x: 0, y: 0 });
  const lastPoint = useRef({ x: 0, y: 0 });
  const [scalingFactor, setScalingFactor] = useState({
    x: WORLD_WIDTH / window.innerWidth,
    y: WORLD_HEIGHT /  window.innerHeight
  });

  const [inverseScalingFactor, setInverseScalingFactor] = useState({
    x: window.innerWidth / WORLD_WIDTH,
    y: window.innerHeight / WORLD_HEIGHT,
  });

  const createMarker = (position: { x: number; y: number; }) => {
    const box = new Graphics();
    box.beginFill(0xFF0000);
    box.drawRect(0, 0, 100, 100);
    box.position.set(position.x - 5, position.y - 5);
    box.endFill();
    return box;
  };

  const handleMessage = useCallback((event: MessageEvent) => {
    const data: ServerMessage = JSON.parse(event.data);

    switch (data.type) {
    case 'S_CONNECTED_USERS':
      data.payload.users.forEach((user) => {
        addUser({
          id: user.userId,
          position: user.position,
          isOwner: user.isOwner,
        });
      });
      break;

    case 'S_USER_CONNECTED':
      addUser({
        id: data.payload.userId,
        position: { x: 0, y: 0},
        isOwner: false,
      });
      break;

    case 'S_USER_DISCONNECTED':
      removeUser(data.payload.userId);
      break;

    case 'S_CURSOR_POSITION':
      updateUserCursor(data.payload.userId, getScreenPosition(data.payload.position));
      break;
    }
  }, [addUser, removeUser, updateUserCursor]);

  const getWorldPosition = (position: { x: number, y: number }) => {
    return { 
      x: Math.round(position.x * scalingFactor.x),
      y: Math.round(position.y * scalingFactor.y), 
    };
  };

  const getScreenPosition = (position: { x: number, y: number }) => {
    return {
      x: Math.round(position.x * inverseScalingFactor.x),
      y: Math.round(position.y * inverseScalingFactor.y),
    };
  };

  const fit = (center: boolean, stage: Container, screenWidth: number, screenHeight: number) => {
    stage.scale.x = inverseScalingFactor.x;
    stage.scale.y = inverseScalingFactor.y;

    if (stage.scale.x < stage.scale.y) {
      stage.scale.y = stage.scale.x;
    } else {
      stage.scale.x = stage.scale.y;
    }

    const virtualWidthInScreenPixels = WORLD_WIDTH * stage.scale.x;
    const virtualHeightInScreenPixels = WORLD_HEIGHT * stage.scale.y;
    const centerXInScreenPixels = screenWidth * 0.5;
    const centerYInScreenPixels = screenHeight * 0.5;

    if (center) {
      stage.position.x = centerXInScreenPixels;
      stage.position.y = centerYInScreenPixels;
    } else {
      stage.position.x = centerXInScreenPixels - virtualWidthInScreenPixels * 0.5;
      stage.position.y = centerYInScreenPixels - virtualHeightInScreenPixels * 0.5;
    }
  };

  useEffect(() => {
    if (!sceneRootRef.current) {
      return;
    }

    const sceneRoot = sceneRootRef.current;

    const app = new Application<HTMLCanvasElement>({
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      backgroundColor: 0x2F2F2F,
      autoDensity: true,
      resolution: devicePixelRatio,
    });

    const handleResize = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      setScalingFactor({ x: WORLD_WIDTH / window.innerWidth, y: WORLD_HEIGHT /  window.innerHeight });
      setInverseScalingFactor({ x: window.innerWidth / WORLD_WIDTH, y: window.innerHeight / WORLD_HEIGHT });
      fit(false, app.stage, window.innerWidth, window.innerHeight);
    };

    app.renderer.view.style.display = 'block';
    sceneRoot.appendChild(app.view);
    app.ticker.start();
    window.addEventListener('resize', handleResize);

    const interval = setInterval(async () => {
      if (currentPoint.current.x !== lastPoint.current.x || currentPoint.current.y !== lastPoint.current.y) {
        const worldPoint = getWorldPosition({ x: currentPoint.current.x, y: currentPoint.current.y });

        sendMessage({
          type: 'C_CURSOR_POSITION',
          payload: {
            position: worldPoint,
          }
        });

        lastPoint.current = { ... currentPoint.current };
      }
    }, 60) as any;

    setPositionNotifyInterval(interval);

    // viewport.addEventListener('mousemove', (event) => {
    //   currentPoint.current = { x: event.screenX, y: event.screenY };
    // });

    const boxContainer = new Container();
    boxContainer.interactive = true;

    // const box = new Graphics();
    // box.beginFill(0xFFF8DC);
    // box.drawRect(0, 0, 100, 100);
    // box.endFill();
    // box.position.set(window.innerWidth / 2 - box.width / 2, window.innerHeight / 2 - box.height / 2);
    // boxContainer.addChild(box);
    app.stage.addChild(boxContainer);

    const marker = createMarker(getScreenPosition({ x: 450, y: 450 }));
    boxContainer.addChild(marker);

    let startPosition = { x: 0, y: 0 };
    let dragOffset = { x: 0, y: 0 };
    let isDragging = false;

    const onDragStart = (event: any) => {
      isDragging = true;
      startPosition = event.data.getLocalPosition(boxContainer.parent);

      dragOffset = {
        x: startPosition.x - boxContainer.position.x,
        y: startPosition.y - boxContainer.position.y,
      };
    };

    const onDragMove = (event: any) => {
      if (isDragging) {
        const newPosition = event.data.getLocalPosition(boxContainer.parent);
        boxContainer.position.x = newPosition.x - dragOffset.x;
        boxContainer.position.y = newPosition.y - dragOffset.y;
      }
    };
    
    const onDragEnd = (event: any) => {
      isDragging = false;
    };

    const onPointerMove = (event: PointerEvent) => {
      // console.log(scalingFactor);
      currentPoint.current = { x: event.x, y: event.y };
      // console.log('Originalposition: ', event.x, event.y);
      // const worldPosition = getWorldPosition(event.x, event.y);
      // console.log('World position:', worldPosition);
      // console.log('Screen position:', getScreenPosition(worldPosition.x, worldPosition.y));
      // console.log('---');
    };

    window.addEventListener('pointermove', onPointerMove);

    boxContainer.on('pointerdown', onDragStart);
    boxContainer.on('pointermove', onDragMove);
    boxContainer.on('pointerup', onDragEnd);
    boxContainer.on('pointerupoutside', onDragEnd);

    return () => {
      boxContainer.off('pointermove', onDragMove);
      boxContainer.off('pointerup', onDragEnd);
      boxContainer.off('pointerupoutside', onDragEnd);
      boxContainer.off('pointerdown', onDragStart);
      window.removeEventListener('pointermove', onPointerMove);
      app.destroy(true);
      window.removeEventListener('resize', handleResize);
      clearInterval(positionNotifyInterval);
    };
  }, [sendMessage]);

  useEffect(() => {
    if (connection) {
      connection.addEventListener('message', handleMessage);
    }

    return () => connection?.removeEventListener('message', handleMessage);
  }, [connection, handleMessage]);

  const centerViewport = () => {
    if (!viewportRef.current) {
      return;
    }

    viewportRef.current.moveCenter({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  };

  return (
    <>
      <div ref={sceneRootRef}></div>
      {[...users.values()].filter((user) => !user.isOwner).map((user) => (<Cursor key={user.id} point={[user.position.x, user.position.y]} />))}
      
      <div className='scene-overlay-ui'>
        <button className='button square icon' title='Center' onClick={centerViewport} style={{ display: 'block' }} />

        <div style={{ marginTop: 8 }} className='panel'>
          <b> Connected users ({ users.size }) </b>

          <ol>
            {[...users.values()].map((user) => (<li key={user.id}> {user.id} {user.isOwner && '(You)'} </li>))}
          </ol>
        </div>
      </div>
    </>
  );
};