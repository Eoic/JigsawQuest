import { Viewport } from 'pixi-viewport';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Application, Graphics } from 'pixi.js';
import { useSceneStore, useWebSocketStore } from '../store';

export const Scene = () => {
  const sceneRootRef = useRef<HTMLDivElement>(null);
  const [sceneData, setSceneData] = useState<{ app: Application | null; viewport: Viewport | null }>({ app: null, viewport: null });
  const { sendMessage, connection } = useWebSocketStore();
  const { users, addUser, removeUser } = useSceneStore();

  const handleMessage = useCallback((event: Event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
    case 'S_CONNECTED_USERS':
      data.payload.forEach((username) => {
        addUser({
          id: username,
          username,
          cursorPosition: { x: 0, y: 0 },
        });
      });
      break;
    case 'S_USER_DISCONNECTED':
      console.log('User disconnected', data.payload);
      removeUser(data.payload);
      break;
    }
  }, [addUser, removeUser]);

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

    const viewport = new Viewport({
      events: app.renderer.events,
      worldWidth: 1000,
      worldHeight: 1000,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    })
      .wheel()
      .drag()
      .decelerate({ friction: 0.9 })
      .pinch({ percent: 2 })
      .clampZoom({ minScale: 0.1, maxScale: 5 });

    const handleResize = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      viewport.resize(window.innerWidth, window.innerHeight, 1000, 1000);
    };

    app.renderer.view.style.display = 'block';
    sceneRoot.appendChild(app.view);
    app.stage.addChild(viewport);
    app.ticker.start();
    window.addEventListener('resize', handleResize);

    viewport.addEventListener('mousemove', (event) => {
      const worldPoint = viewport.toWorld({ x: event.screenX, y: event.screenY });

      sendMessage({
        type: 'C_CURSOR_POSITION',
        data: worldPoint,
      });
    });

    const box = new Graphics();
    box.interactive = true;
    box.beginFill(0xFFF8DC);
    box.drawRect(0, 0, 1000, 1000);
    box.position.set(viewport.screenWidth / 2 - box.width / 2, viewport.screenHeight / 2 - box.height / 2);
    viewport.addChild(box);

    let dragPoint = { x: 0, y: 0 };

    const onDragStart = (event: any) => {
      event.stopPropagation();
      dragPoint = event.data.getLocalPosition(box.parent);
      dragPoint.x -= box.x;
      dragPoint.y -= box.y;
      box.parent.on('pointermove', onDragMove);
    };
    
    const onDragMove = (event: any) => {
      const newPoint = event.data.getLocalPosition(box.parent);
      box.x = newPoint.x - dragPoint.x;
      box.y = newPoint.y - dragPoint.y;
    };
    
    const onDragEnd = (event: any) => {
      event.stopPropagation();
      box.parent.off('pointermove', onDragMove);
    };

    box.on('pointerdown', onDragStart);
    box.on('pointerup', onDragEnd);
    box.on('pointerupoutside', onDragEnd);

    setSceneData({ app, viewport });

    return () => {
      box.off('pointerdown', onDragStart);
      box.off('pointerup', onDragEnd);
      box.off('pointerupoutside', onDragEnd);
      app.destroy(true);
      window.removeEventListener('resize', handleResize);
    };
  }, [sendMessage]);

  useEffect(() => {
    if (connection) {
      connection.addEventListener('message', handleMessage);
    }

    return () => connection?.removeEventListener('message', handleMessage);
  }, [connection, handleMessage]);

  const centerViewport = () => {
    if (!sceneData.viewport) {
      return;
    }

    sceneData.viewport.moveCenter({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  };

  return (
    <>
      <div ref={sceneRootRef}></div>
      {/* <Cursor point={point} /> */}
      <div className='scene-overlay-ui'>
        <button className='button square icon' title='Center' onClick={centerViewport} />

        <div style={{ marginTop: 8 }}>
          <b> Connected users ({ users.size }) </b>

          <ul>
            {[...users.values()].map((user) => (<li key={user.username}> {user.username} </li>))}
          </ul>
        </div>
      </div>
    </>
  );
};