import { Graphics, Point } from 'pixi.js';
import { PuzzlePiece } from './puzzle-piece.ts';
import { Selectable } from './selectable.ts';

export class SelectionBox extends Graphics{
    static BACKGROUND_COLOR: number = 0x2378A9;
    static BORDER_COLOR: number = 0x99CDEA;
    static OPACITY: number = 0.4;

    private _isActive: boolean;
    private _origin: Point;
    private _topLeft: Point;
    private _size: { width: number, height: number };
    private _selectableItems: Map<number, Selectable>;

    get isActive() {
        return this._isActive;
    }

    constructor() {
        super();
        this._isActive = false;
        this._origin = new Point();
        this._topLeft = new Point();
        this._size = { width: 0, height: 0 };
        this._selectableItems = new Map();
        this.alpha = SelectionBox.OPACITY;
    }

    public beginSelect(origin: Point, selectableItems: Map<number, PuzzlePiece>) {
        this._isActive = true;
        this._origin = origin;

        if (!(selectableItems instanceof Map))
            throw new Error('Invalid selectables provided to selection box!');

        this._selectableItems = selectableItems;
        this.draw(origin.x, origin.y, this._size.width, this._size.height);
    }

    public select(cursorPosition: Point) {
        if (!this.isActive || !this._origin)
            return;

        this._size.width = Math.abs(this._origin.x - cursorPosition.x);
        this._size.height = Math.abs(this._origin.y - cursorPosition.y);
        this._topLeft.set(Math.min(this._origin.x, cursorPosition.x), Math.min(this._origin.y, cursorPosition.y));
        this.draw(this._topLeft.x, this._topLeft.y, this._size.width, this._size.height);
        this.selectItems(this._selectableItems);
    }

    public deselect() {
        for (const item of this._selectableItems.values()) {
            if (item.isSelected)
                item.deselect();
        }
    }

    public endSelect() {
        if (this._size.width * this._size.height === 0)
            this.deselect();

        this.clear();
        this._isActive = false;
        this._origin.set(0, 0);
        this._topLeft.set(0, 0);
        this._size = { width: 0, height: 0 };
    }

    private selectItems(items: Map<number, Selectable>) {
        for (const item of items.values()) {
            if (this.isSelectValid(item)) {
                item.select();
                continue;
            }

            item.deselect();
        }
    }

    private isSelectValid(item: Selectable) {
        const { x, y, width, height } = item.dimensions;

        if (x >= this._topLeft.x && x + width < this._topLeft.x + this._size.width) {
            if (y >= this._topLeft.y && y + height <= this._topLeft.y + this._size.height)
                return true;
        }

        return false;
    }

    private draw(x: number, y: number, width: number, height: number) {
        this.clear();
        this.lineStyle({ width: 1, color: SelectionBox.BORDER_COLOR });
        this.beginFill(SelectionBox.BACKGROUND_COLOR);
        this.drawRect(x, y, width, height);
        this.endFill();
    }
}