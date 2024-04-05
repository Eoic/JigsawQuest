import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { Puzzle } from '../../entities/puzzle.ts';
import { SelectionBox } from '../../entities/selection-box.ts';
import { BACKGROUND_COLOR, WORLD_HEIGHT, WORLD_WIDTH } from '../../constants';
import {Container} from "pixi.js";
import {PuzzlePiece} from "../../entities/puzzle-piece.ts";

// TODO:
// * Implement ability to drag multiple puzzle pieces after selection with selection box (wrap active selection within the container?).

export class Scene {
    private readonly _viewport: Viewport;
    private readonly _app: PIXI.Application<HTMLCanvasElement>;
    private readonly _selectionBox: SelectionBox;
    private readonly _puzzle: Puzzle | null;

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

    private handleAppPointerDown(event: PointerEvent) {
        if (this._puzzle!.activeDraggable || event.button !== 0)
            return;

        this._puzzle?.calculateBounds();
        this._selectionBox.beginSelecting(new PIXI.Point(event.clientX, event.clientY ), this._puzzle!.pieces);
    }

    private handleAppPointerMove(event: PointerEvent) {
        if (!this._selectionBox.isActive)
            return;

        this._selectionBox.select(new PIXI.Point(event.clientX, event.clientY));
    }

    private handleAppPointerUp(_event: PointerEvent) {
        this._selectionBox.endSelect();
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
