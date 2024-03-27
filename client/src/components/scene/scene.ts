import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { BACKGROUND_COLOR, WORLD_HEIGHT, WORLD_WIDTH } from '../../constants';

export class Scene {
    private viewport: Viewport;
    private app: PIXI.Application<HTMLCanvasElement>;

    constructor() {
        this.app = this.setupApp(document.body);
        this.viewport = this.setupViewport(this.app);
        this.setupEvents();
        this.setupEntities();
    }

    private setupApp(container: HTMLElement): PIXI.Application<HTMLCanvasElement> {
        const app = new PIXI.Application({
            resizeTo: window,
            antialias: true,
            autoDensity: true,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: BACKGROUND_COLOR,
        }) as PIXI.Application<HTMLCanvasElement>;

        container.appendChild(app.view);

        return app;
    }

    private setupViewport(app: PIXI.Application): Viewport {
        const viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: WORLD_WIDTH,
            worldHeight: WORLD_HEIGHT,
            events: app.renderer.events,
        });

        app.stage.addChild(viewport);

        viewport
            .drag()
            .pinch()
            .wheel()
            .clampZoom({
                minScale: 0.15,
                maxScale: 12.50,
            });

        viewport.fit();
        viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

        return viewport;
    }

    private setupEvents() {
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    private setupEntities() {
        const shape = new PIXI.Sprite(PIXI.Texture.WHITE);
        shape.tint = 0xFF0FFA;
        shape.width = 256;
        shape.height = 256;
        shape.position.set(0, 0);
        this.viewport.addChild(shape);
    }

    private handleResize(): void {
        this.app?.resize();
        this.viewport?.resize(window.innerWidth, window.innerHeight);
    }
}
