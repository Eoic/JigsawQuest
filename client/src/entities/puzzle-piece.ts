import { OutlineFilter } from '@pixi/filter-outline';
import { Sprite, Point, Texture, utils } from 'pixi.js';

export class PuzzlePiece extends Sprite{
    public static Z_INDEX_TOP = 1000;
    public static HOVER_FILTER = new OutlineFilter(0.85, 0x99FF9A);

    private readonly _uid: number;
    private readonly _zIndexOriginal: number;
    private _dragPosition: Point;

    public get uid() {
        return this._uid;
    }

    constructor(texture: Texture) {
        super(texture)
        this._uid = utils.uid();
        this._dragPosition = new Point();
        this._zIndexOriginal = this.zIndex;
        this.eventMode = 'dynamic';
    }

    startDrag(parentPosition: Point) {
        this.zIndex = PuzzlePiece.Z_INDEX_TOP;
        this.filters = [PuzzlePiece.HOVER_FILTER];
        this._dragPosition.set(parentPosition.x - this.x, parentPosition.y - this.y);
    }

    drag(parentPosition: Point) {
        this.x = parentPosition.x - this._dragPosition.x;
        this.y = parentPosition.y - this._dragPosition.y;
    }

    endDrag() {
        this.filters = [];
        this.zIndex = this._zIndexOriginal;
    }
}