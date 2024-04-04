import {Sprite, Point, Texture, utils, Color} from 'pixi.js';

export class PuzzlePiece extends Sprite{
    public static Z_INDEX_TOP = 1000;
    // public static SELECT_FILTER = new OutlineFilter(2, 0x99FF9A);
    // public static HOVER_FILTER = new OutlineFilter(2, 0x99FF9A);

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

    public select() {
        if (this._isSelected)
            return;

        this.zIndex = PuzzlePiece.Z_INDEX_TOP;
        this.tint = new Color(0x000FFF);
        // this._addFilters(PuzzlePiece.SELECT_FILTER);
        this._isSelected = true;
    }

    public deselect() {
        if (!this._isSelected)
            return;

        this.zIndex = this._zIndexOriginal;
        this.tint = new Color(0xFFFFFF);
        // this._removeFilters(PuzzlePiece.SELECT_FILTER);
        this._isSelected = false;
    }

    public startDrag(parentPosition: Point) {
        this.zIndex = PuzzlePiece.Z_INDEX_TOP;
        this._dragPosition.set(parentPosition.x - this.x, parentPosition.y - this.y);
    }

    public drag(parentPosition: Point) {
        this.x = parentPosition.x - this._dragPosition.x;
        this.y = parentPosition.y - this._dragPosition.y;
    }

    public endDrag() {
        this.zIndex = this._zIndexOriginal;
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

    // private _addFilters(...items: Filter[]): void {
    //     items.forEach((item) => {
    //         if (this.filters?.includes(item)) {
    //             console.warn(`Filter ${item} is already applied!`)
    //             return;
    //         }
    //
    //         this.filters?.push(item);
    //     });
    // }
    //
    // private _removeFilters(...items: Filter[]): void {
    //     this.filters = this.filters?.filter((item) => !items.includes(item)) || [];
    // }
}