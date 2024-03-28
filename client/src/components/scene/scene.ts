import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { BACKGROUND_COLOR, WORLD_HEIGHT, WORLD_WIDTH } from '../../constants';
import {Assets, Loader, Texture} from "pixi.js";

export class Scene {
    private readonly viewport: Viewport;
    private readonly app: PIXI.Application<HTMLCanvasElement>;

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
        PIXI.Assets.load('puzzle.png').then((texture) => {
            const size = 100;
            const gap = 15;

            console.log(this.viewport.screenWidth / 2 - 500)

            for (let x = 0; x < 10; x++) {
                for (let y = 0; y < 10; y++) {
                    const rectangle = new PIXI.Rectangle(size * x, size * y, size, size);
                    const piece = new Texture(texture, rectangle);
                    const pieceSprite = new PIXI.Sprite(piece);
                    pieceSprite.position.set(x * (size + gap), y * (size + gap));
                    this.viewport.addChild(pieceSprite);
                }
            }

            this.viewport.moveCenter(this.viewport.screenWidth / 2, this.viewport.screenHeight / 2);
        }).catch((error) => {
            console.error(error);
        });
    }

    private handleResize(): void {
        this.app?.resize();
        this.viewport?.resize(window.innerWidth, window.innerHeight);
    }
}
