import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { Puzzle } from '../../entities/puzzle.ts';
import { SelectionBox } from '../../entities/selection-box.ts';
import { WORLD_BACKGROUND_COLOR, WORLD_HEIGHT, WORLD_WIDTH } from '../../constants';

export class Scene {
    private readonly _viewport: Viewport;
    private readonly _puzzle: Puzzle | null;
    private readonly _selectionBox: SelectionBox;
    private readonly _app: PIXI.Application<HTMLCanvasElement>;

    constructor() {
        this._app = this.setupApp(document.body);
        this._viewport = this.setupViewport(this._app);
        this._selectionBox = new SelectionBox();
        this._puzzle = new Puzzle(this._viewport, this._selectionBox);
        this._app.stage.addChild(this._selectionBox);
        this._viewport.addChild(this._puzzle);
        this.setupEvents();
    }

    private setupApp(container: HTMLElement): PIXI.Application<HTMLCanvasElement> {
        const app = new PIXI.Application<HTMLCanvasElement>({
            resizeTo: window,
            antialias: true,
            autoDensity: true,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: WORLD_BACKGROUND_COLOR,
            resolution: 2,
        });

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
        window.addEventListener('resize', this.handleWindowResize);
        window.addEventListener('mousedown', this.handleWindowMouseDown);
        this._app.renderer.view.addEventListener('pointerdown', this.handleAppPointerDown);
        this._app.renderer.view.addEventListener('pointermove', this.handleAppPointerMove);
        this._app.renderer.view.addEventListener('pointerup', this.handleAppPointerUp);
    }

    /**
     * Make selection box active and initiate selection rectangle drawing.
     */
    private handleAppPointerDown = (event: PointerEvent) => {
        if (!this._puzzle || this._puzzle.dragPiece || event.button !== 0)
            return;

        this._puzzle.calculateBounds();
        this._selectionBox.beginSelect(new PIXI.Point(event.clientX, event.clientY), this._puzzle.pieces);
    }

    /**
     * Perform selecting with the selection box rectangle on mouse movement.
     */
    private handleAppPointerMove = (event: PointerEvent) => {
        if (!this._selectionBox.isActive)
            return;

        this._selectionBox.select(new PIXI.Point(event.clientX, event.clientY));
    }

    /**
     * End selection by the selection box if it was activated.
     */
    private handleAppPointerUp = (_event: PointerEvent) => {
        if (this._selectionBox.isActive)
            this._selectionBox.endSelect();
    }

    /**
     * Update the app and the viewport when window is resized.
     */
    private handleWindowResize = () => {
        this._app?.resize();
        this._viewport?.resize(window.innerWidth, window.innerHeight);
    }

    /**
     * Disable middle mouse click scrolling.
     */
    private handleWindowMouseDown = (event: MouseEvent) => {
        if (event.button === 1) {
            event.preventDefault();
            return false;
        }

        return true;
    }
}
