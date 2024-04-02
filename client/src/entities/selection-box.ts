import {Container, Graphics, Point} from 'pixi.js';

export class SelectionBox {
    private _isActive: boolean;
    private _origin: Point | null;
    private _graphics: Graphics;

    get isActive() {
        return this._isActive;
    }

    constructor() {
        this._origin = new Point();
        this._isActive = false;
        this._graphics = new Graphics();
        this._graphics.alpha = 0.4
    }

    public beginSelecting(origin: Point) {
        this._isActive = true;
        this._origin = origin;
        this._graphics.clear();
        this._graphics.beginFill(0x2378A9);
        this._graphics.drawRect(origin.x, origin.y, 5, 5);
        this._graphics.endFill();
    }

    public select(cursorPosition: Point) {
        if (!this.isActive || !this._origin)
            return;

        const width = Math.abs(this._origin.x - cursorPosition.x);
        const height = Math.abs(this._origin.y - cursorPosition.y);

        this._graphics.clear();
        this._graphics.lineStyle({ width: 1, color: 0x99CDEA });
        this._graphics.beginFill(0x2378A9);
        this._graphics.drawRect(Math.min(this._origin.x, cursorPosition.x), Math.min(this._origin.y, cursorPosition.y), width, height);
        this._graphics.endFill();
    }

    public endSelect() {
        this._graphics.clear();
        this._isActive = false;
        this._origin = null;
    }

    public addInto(stage: Container) {
        stage.addChild(this._graphics);
    }
}