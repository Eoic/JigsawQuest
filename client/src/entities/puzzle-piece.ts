import { OutlineFilter } from '@pixi/filter-outline';
import { Sprite, Point, Texture, utils } from 'pixi.js';

export class PuzzlePiece extends Sprite{
    public static Z_INDEX_TOP = 1000;
    public static SELECT_FILTER = new OutlineFilter(0.85, 0x99FF9A);
    public static HOVER_FILTER = new OutlineFilter(0.85, 0x99FF9A);

    private readonly _uid: number;
    private readonly _zIndexOriginal: number;
    private _dragPosition: Point;
    private _isSelected: boolean;

    public get uid() {
        return this._uid;
    }

    constructor(texture: Texture) {
        super(texture)
        this._uid = utils.uid();
        this._dragPosition = new Point();
        this._zIndexOriginal = this.zIndex;
        this._isSelected = false;
        this.eventMode = 'dynamic';
    }

    select() {
        this.zIndex = PuzzlePiece.Z_INDEX_TOP;
        this.filters = [PuzzlePiece.SELECT_FILTER];
        this._isSelected = true;
    }

    deselect() {
        this.filters = [];
        this.zIndex = this._zIndexOriginal;
        this._isSelected = false;
    }

    startDrag(parentPosition: Point) {
        this.zIndex = PuzzlePiece.Z_INDEX_TOP;
        this._dragPosition.set(parentPosition.x - this.x, parentPosition.y - this.y);
    }

    drag(parentPosition: Point) {
        this.x = parentPosition.x - this._dragPosition.x;
        this.y = parentPosition.y - this._dragPosition.y;
    }

    endDrag() {
        this.zIndex = this._zIndexOriginal;
    }

    startHover() {
        if (this._isSelected)
            return;

        this.filters = [PuzzlePiece.HOVER_FILTER];
    }

    endHover() {
        if (this._isSelected)
            return;

        this.filters = [];
    }
}