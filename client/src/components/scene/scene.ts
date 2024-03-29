import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { OutlineFilter } from "@pixi/filter-outline";
import { BACKGROUND_COLOR, WORLD_HEIGHT, WORLD_WIDTH } from '../../constants';

const HOVER_FILTER: OutlineFilter = new OutlineFilter(1, 0x99FF9A);

class ActiveDraggable {
    public static Z_INDEX_TOP = 1000;

    private readonly _position: PIXI.Point;
    private readonly _element: PIXI.DisplayObject;
    private readonly _zIndexOriginal: number;

    get position() {
        return this._position;
    }

    get element() {
        return this._element;
    }

    get zIndexOriginal() {
        return this._zIndexOriginal;
    }

    constructor(element: PIXI.DisplayObject) {
        this._position = new PIXI.Point();
        this._element = element;
        this._zIndexOriginal = element.zIndex;
    }

    public handleDragStart(parentPosition: PIXI.Point) {
        this.position.set(parentPosition.x - this.element.x, parentPosition.y - this.element.y);
        this.element.zIndex = ActiveDraggable.Z_INDEX_TOP;
        this.element.filters = [HOVER_FILTER];
    }

    public handleDrag(parentPosition: PIXI.Point) {
        this.element.x = parentPosition.x - this.position.x;
        this.element.y = parentPosition.y - this.position.y;
    }

    public handleDragEnd() {
        this.element.zIndex = this.zIndexOriginal;
        this.element.filters = [];
    }
}

export class Scene {
    private readonly viewport: Viewport;
    private readonly app: PIXI.Application<HTMLCanvasElement>;
    private activeDraggable: ActiveDraggable | null = null;

    constructor() {
        this.app = this.setupApp(document.body);
        this.viewport = this.setupViewport(this.app);
        this.setupEvents();
        this.setupEntities();
        this.handleDrag = this.handleDrag.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleHoverStart = this.handleHoverStart.bind(this);
        this.handleHoverEnd = this.handleHoverEnd.bind(this);
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
            const gap = 15;
            const size = 100;
            const puzzleHalfSize = (gap * 9 + 100 * 10) / 2;
            const offsetX = this.viewport.worldWidth / 2 - puzzleHalfSize;
            const offsetY = this.viewport.worldHeight / 2 - puzzleHalfSize;

            const container = new PIXI.Container();
            container.position.set(0, 0);
            container.sortableChildren = true;
            container.interactiveChildren = true;
            container.eventMode = 'dynamic';
            container.on('pointerdown', this.handleDragStart.bind(this));
            container.on('pointerup', this.handleDragEnd);
            container.on('pointerupoutside', this.handleDragEnd);
            container.on('pointerover', this.handleHoverStart);
            container.on('pointerout', this.handleHoverEnd);

            for (let x = 0; x < 10; x++) {
                for (let y = 0; y < 10; y++) {
                    const rectangle = new PIXI.Rectangle(size * x, size * y, size, size);
                    const piece = new PIXI.Texture(texture, rectangle);
                    const pieceSprite = new PIXI.Sprite(piece);

                    pieceSprite.position.set(
                        x * (size + gap),
                        y * (size + gap),
                    );

                    pieceSprite.eventMode = 'dynamic';
                    container.addChild(pieceSprite);
                }
            }

            container.position.set(offsetX, offsetY);
            this.viewport.addChild(container);
        }).catch((error) => console.error(error));

    }

    private handleDragStart(event: PIXI.FederatedPointerEvent): void {
        event.stopPropagation();
        const parentPosition = event.getLocalPosition(this.viewport);
        this.activeDraggable = new ActiveDraggable(event.target as PIXI.DisplayObject);
        this.activeDraggable.handleDragStart(parentPosition);
        this.viewport.on('pointermove', this.handleDrag);
    }

    private handleDrag(event: PIXI.FederatedPointerEvent) {
        if (!this.activeDraggable)
            return;

        const parentPosition = event.getLocalPosition(this.viewport);
        this.activeDraggable.handleDrag(parentPosition);
    }

    private handleDragEnd(event: PIXI.FederatedPointerEvent) {
        if (!this.activeDraggable)
            return;

        event.stopPropagation();
        this.viewport.off('pointermove', this.handleDrag);
        this.activeDraggable.handleDragEnd();
        this.activeDraggable = null;
    }

    private handleHoverStart(event: PIXI.FederatedPointerEvent) {
        if (this.activeDraggable)
            return;

        event.target.filters = [HOVER_FILTER];
    }

    private handleHoverEnd(event: PIXI.FederatedPointerEvent) {
        if (this.activeDraggable)
            return;

        event.target.filters = [];
    }

    private handleResize(): void {
        this.app?.resize();
        this.viewport?.resize(window.innerWidth, window.innerHeight);
    }
}
