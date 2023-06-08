import { Application } from 'pixi.js';
import { useEffect, useRef } from 'react';

export const Scene = () => {
  const sceneRootRef = useRef<HTMLDivElement>(null);

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
      resizeTo: window,
    });

    app.renderer.view.onmousemove = ((event: MouseEvent) => {
      console.log({ x: event.screenX, y: event.screenY });
    });

    sceneRoot.appendChild(app.view);

    return () => {
      app.destroy(true);
    };
  }, []);

  return (
    <div ref={sceneRootRef}>
    </div>
  );
};