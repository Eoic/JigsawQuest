import { Sprite, Point, Texture, utils, Color } from 'pixi.js';
import { Puzzle } from "./puzzle.ts";

export class PuzzlePiece extends Sprite {
    public static Z_INDEX_SELECTION = 1;
    public static Z_INDEX_DRAG = 2;

    private readonly _uid: number;
    private _dragPosition: Point;
    private _isSelected: boolean;

    public get uid() {
        return this._uid;
    }

    public get isSelected() {
        return this._isSelected;
    }

    constructor(texture: Texture, puzzle: Puzzle) {
        super(texture)
        this._uid = utils.uid();
        this._dragPosition = new Point();
        this._isSelected = false;
        this.eventMode = 'dynamic';
    }

    public select() {
        if (this._isSelected)
            return;

        this.tint = new Color(0x00FFF0);
        this._isSelected = true;
    }

    public deselect() {
        if (!this._isSelected)
            return;

        this.tint = new Color(0xFFFFFF);
        this._isSelected = false;
    }

    public startDrag(parentPosition: Point) {
        this._dragPosition.set(
            parentPosition.x - this.x,
            parentPosition.y - this.y
        );
    }

    public drag(parentPosition: Point) {
        this.x = parentPosition.x - this._dragPosition.x;
        this.y = parentPosition.y - this._dragPosition.y;
    }

    public endDrag() {
    }

    public startHover() {
        if (this._isSelected)
            return;

        this.tint = new Color(0xFFF000);
    }

    public endHover() {
        if (this._isSelected)
            return;

        this.tint = new Color(0xFFFFFF);
    }
}