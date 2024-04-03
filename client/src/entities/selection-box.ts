import { PuzzlePiece } from './puzzle-piece.ts';
import { Container, Graphics, Point } from 'pixi.js';

export class SelectionBox {
    private readonly _graphics: Graphics;
    private _isActive: boolean;
    private _origin: Point | null;
    private _size: { width: number, height: number }
    private _selectableItems: Map<number, PuzzlePiece> | undefined;

    get isActive() {
        return this._isActive;
    }

    constructor() {
        this._origin = new Point();
        this._isActive = false;
        this._graphics = new Graphics();
        this._graphics.alpha = 0.4
        this._size = { width: 0, height: 0 };
    }

    public beginSelecting(origin: Point, selectableItems: Map<number, PuzzlePiece>) {
        this._isActive = true;
        this._origin = origin;
        this._selectableItems = selectableItems;
        this._graphics.clear();
        this._graphics.beginFill(0x2378A9);
        this._graphics.drawRect(origin.x, origin.y, this._size.width, this._size.height);
        this._graphics.endFill();
    }

    public select(cursorPosition: Point) {
        if (!this.isActive || !this._origin)
            return;

        this._size.width = Math.abs(this._origin.x - cursorPosition.x);
        this._size.height = Math.abs(this._origin.y - cursorPosition.y);

        this._graphics.clear();
        this._graphics.lineStyle({ width: 1, color: 0x99CDEA });
        this._graphics.beginFill(0x2378A9);
        this._graphics.drawRect(
            Math.min(this._origin.x, cursorPosition.x),
            Math.min(this._origin.y, cursorPosition.y),
            this._size.width,
            this._size.height,
        );
        this._graphics.endFill();

        if (this._selectableItems)
            this._selectItems(this._selectableItems);
    }

    public endSelect() {
        this._graphics.clear();
        this._isActive = false;
        this._origin = null;
        this._size = { width: 0, height: 0 };
    }

    public addInto(stage: Container) {
        stage.addChild(this._graphics);
    }

    public _selectItems(items: Map<number, PuzzlePiece>) {
        for (const item of items.values()) {
            const { x, y, width, height } = item._bounds.getRectangle();

            if (x >= this._origin!.x && x + width < this._origin!.x + this._size.width) {
                if (y >= this._origin!.y && y + height <= this._origin!.y + this._size.height) {
                    item.select();
                    continue;
                }
            }

            item.deselect();
        }
    }
}