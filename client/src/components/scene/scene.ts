import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { PuzzlePiece } from '../../entities/puzzle-piece.ts';
import { SelectionBox } from '../../entities/selection-box.ts';
import { BACKGROUND_COLOR, WORLD_HEIGHT, WORLD_WIDTH } from '../../constants';

// TODO:
// * Should recompute puzzle container bounds on scene zoom and drag.
// * Move puzzle piece management into a separate class `Puzzle`, which extends PIXI.Container class.
// * Implement ability to drag multiple puzzle pieces after selection with selection box (wrap active selection within the container?).

export class Scene {
    private readonly _viewport: Viewport;
    private readonly _app: PIXI.Application<HTMLCanvasElement>;
    private _selectionBox: SelectionBox;
    private _activeDraggable: PuzzlePiece | null;
    private _puzzlePieces: Map<number, PuzzlePiece>;

    constructor() {
        this._app = this.setupApp(document.body);
        this._viewport = this.setupViewport(this._app);

        this.setupEvents();
        this.setupEntities();
        this.handleDrag = this.handleDrag.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleHoverStart = this.handleHoverStart.bind(this);
        this.handleHoverEnd = this.handleHoverEnd.bind(this);

        // Selection box.
        this._selectionBox = new SelectionBox();
        this._selectionBox.addInto(this._app.stage);

        // Pieces.
        this._activeDraggable = null;
        this._puzzlePieces = new Map();
    }

    private setupApp(container: HTMLElement): PIXI.Application<HTMLCanvasElement> {
        const app = new PIXI.Application({
            resizeTo: window,
            antialias: true,
            autoDensity: true,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: BACKGROUND_COLOR,
            resolution: 2,
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
            disableOnContextMenu: true,
        });

        app.stage.addChild(viewport);

        viewport
            .drag({ mouseButtons: 'middle-right' })
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
        window.addEventListener('resize', this.handleWindowResize.bind(this));
        window.addEventListener('mousedown', this.handleWindowMouseDown.bind(this));
        this._app.renderer.view.addEventListener('pointerdown', this.handleAppPointerDown.bind(this));
        this._app.renderer.view.addEventListener('pointermove', this.handleAppPointerMove.bind(this));
        this._app.renderer.view.addEventListener('pointerup', this.handleAppPointerUp.bind(this));
    }

    private setupEntities() {
        PIXI.Assets.load('puzzle.png').then((texture) => {
            const gap = 15;
            const size = 100;
            const puzzleHalfSize = (gap * 9 + 100 * 10) / 2;
            const offsetX = this._viewport.worldWidth / 2 - puzzleHalfSize;
            const offsetY = this._viewport.worldHeight / 2 - puzzleHalfSize;

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
                    const pieceTexture = new PIXI.Texture(texture, rectangle);
                    const piece = new PuzzlePiece(pieceTexture);

                    piece.position.set(
                        x * (size + gap),
                        y * (size + gap),
                    );

                    container.addChild(piece);
                    this._puzzlePieces.set(piece.uid, piece);
                }
            }

            container.position.set(offsetX, offsetY);
            this._viewport.addChild(container);
            container.getBounds(); // (Temp) To compute bounds of children object. This should be `Puzzle` clas instance, which is a container.
        }).catch((error) => console.error(error));
    }

    private handleAppPointerDown(event: PointerEvent) {
        if (this._activeDraggable || event.button !== 0)
            return;

        this._selectionBox.beginSelecting(new PIXI.Point(event.clientX, event.clientY ), this._puzzlePieces);
    }

    private handleAppPointerMove(event: PointerEvent) {
        if (!this._selectionBox.isActive)
            return;

        this._selectionBox.select(new PIXI.Point(event.clientX, event.clientY));
    }

    private handleAppPointerUp(_event: PointerEvent) {
        this._selectionBox.endSelect();
    }

    private handleDragStart(event: PIXI.FederatedPointerEvent): void {
        if (event.button !== 0)
            return;

        if (!(event.target instanceof PuzzlePiece))
            return;

        event.stopPropagation();
        const parentPosition = event.getLocalPosition(this._viewport);
        this._activeDraggable = this._puzzlePieces.get(event.target.uid) || null;

        if (this._activeDraggable) {
            this._activeDraggable.startDrag(parentPosition);
            this._viewport.on('pointermove', this.handleDrag);
        }
    }

    private handleDrag(event: PIXI.FederatedPointerEvent) {
        if (!this._activeDraggable)
            return;

        const parentPosition = event.getLocalPosition(this._viewport);
        this._activeDraggable.drag(parentPosition);
    }

    private handleDragEnd(event: PIXI.FederatedPointerEvent) {
        if (!this._activeDraggable)
            return;

        event.stopPropagation();
        this._viewport.off('pointermove', this.handleDrag);
        this._activeDraggable.endDrag();
        this._activeDraggable = null;
    }

    private handleHoverStart(event: PIXI.FederatedPointerEvent) {
        if (this._activeDraggable || this._selectionBox.isActive)
            return;

        if (!(event.target instanceof PuzzlePiece))
            return;

        event.target.startHover();
    }

    private handleHoverEnd(event: PIXI.FederatedPointerEvent) {
        if (this._activeDraggable || this._selectionBox.isActive)
            return;

        if (!(event.target instanceof PuzzlePiece))
            return;

        event.target.endHover();
    }

    private handleWindowResize(): void {
        this._app?.resize();
        this._viewport?.resize(window.innerWidth, window.innerHeight);
    }

    private handleWindowMouseDown(event: MouseEvent) {
        if (event.button === 1) {
            event.preventDefault();
            return false;
        }
    }
}
