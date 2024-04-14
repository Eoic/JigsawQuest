import { Graphics, Point } from 'pixi.js';
import { PuzzlePiece } from './puzzle-piece.ts';

export class SelectionBox extends Graphics{
    private _isActive: boolean;
    private _origin: Point;
    private _topLeft: Point;
    private _size: { width: number, height: number };
    private _selectableItems: Map<number, PuzzlePiece> | undefined;

    get isActive() {
        return this._isActive;
    }

    constructor() {
        super();
        this.alpha = 0.4
        this._origin = new Point();
        this._topLeft = new Point();
        this._isActive = false;
        this._size = { width: 0, height: 0 };
    }

    public beginSelect(origin: Point, selectableItems: Map<number, PuzzlePiece>) {
        this._isActive = true;
        this._origin = origin;
        this._selectableItems = selectableItems;
        this.clear();
        this.beginFill(0x2378A9);
        this.drawRect(origin.x, origin.y, this._size.width, this._size.height);
        this.endFill();
    }

    public select(cursorPosition: Point): PuzzlePiece[] {
        if (!this.isActive || !this._origin)
            return [];

        this._size.width = Math.abs(this._origin.x - cursorPosition.x);
        this._size.height = Math.abs(this._origin.y - cursorPosition.y);
        this._topLeft.set(
            Math.min(this._origin.x, cursorPosition.x),
            Math.min(this._origin.y, cursorPosition.y)
        );

        this.clear();
        this.lineStyle({ width: 1, color: 0x99CDEA });
        this.beginFill(0x2378A9);
        this.drawRect(
            this._topLeft.x,
            this._topLeft.y,
            this._size.width,
            this._size.height,
        );
        this.endFill();

        if (this._selectableItems)
            return this._selectItems(this._selectableItems);

        return [];
    }

    public endSelect() {
        this.clear();
        this._isActive = false;
        this._origin.set(0, 0);
        this._topLeft.set(0, 0);
        this._size = { width: 0, height: 0 };
    }

    private _selectItems(items: Map<number, PuzzlePiece>): PuzzlePiece[] {
        const selections = [];

        for (const item of items.values()) {
            const { x, y, width, height } = item._bounds.getRectangle();

            if (x >= this._topLeft.x && x + width < this._topLeft.x + this._size.width) {
                if (y >= this._topLeft.y && y + height <= this._topLeft.y + this._size.height) {
                    item.select();
                    selections.push(item);
                    continue;
                }
            }

            item.deselect();
        }

        return selections;
    }
}