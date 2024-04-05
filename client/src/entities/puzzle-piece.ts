import { Sprite, Point, Texture, utils, Color, Container } from 'pixi.js';

export class PuzzlePiece extends Sprite {
    public static Z_INDEX_SELECTION = 1;
    public static Z_INDEX_DRAG = 2;

    private readonly _uid: number;
    private readonly _selectionsContainer: Container;
    private _dragPosition: Point;
    private _isSelected: boolean;

    public get uid() {
        return this._uid;
    }

    constructor(texture: Texture, selectionContainer: Container) {
        super(texture)
        this._uid = utils.uid();
        this._dragPosition = new Point();
        this._isSelected = false;
        this._selectionsContainer = selectionContainer;
        // this._label = new Text(this.zIndex.toString(), new TextStyle( { align: 'center', fill: 0xFFFFFF, dropShadow: true, dropShadowDistance: 2 }));
        // this._label.position.set(this.position.x + this.width / 2 - this._label.width / 2, this.position.y + this.height / 2 - this._label.height / 2);
        // this.addChild(this._label);
        this.eventMode = 'dynamic';
    }

    public select() {
        if (this._isSelected)
            return;

        this.tint = new Color(0x00FFF0);
        this._isSelected = true;
        this._selectionsContainer.addChild(this);
    }

    public deselect() {
        if (!this._isSelected)
            return;

        this.tint = new Color(0xFFFFFF);
        this._isSelected = false;
        this._selectionsContainer.removeChild(this);
    }

    public startDrag(parentPosition: Point) {
        // this._dragPosition.set(parentPosition.x - this.x, parentPosition.y - this.y);
        this._dragPosition.set(parentPosition.x - this._selectionsContainer.x, parentPosition.y - this._selectionsContainer.y);
    }

    public drag(parentPosition: Point) {
        // this.x = parentPosition.x - this._dragPosition.x;
        // this.y = parentPosition.y - this._dragPosition.y;

        this._selectionsContainer.x = parentPosition.x - this._dragPosition.x;
        this._selectionsContainer.y = parentPosition.y - this._dragPosition.y;
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