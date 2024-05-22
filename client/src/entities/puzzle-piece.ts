import { Selectable } from './selectable';
import { Sprite, Point, Texture, utils, Color } from 'pixi.js';
import { PIECE_HOVER_TINT, PIECE_SELECTION_TINT } from '../constants';

export class PuzzlePiece extends Sprite implements Selectable {
    private readonly _uid: number;
    private _dragPosition: Point;
    private _isSelected: boolean;
    private _isHovered: boolean;

    public get uid() {
        return this._uid;
    }

    public get isSelected() {
        return this._isSelected;
    }

    public get isHovered() {
        return this._isHovered;
    }

    public get dimensions() {
        return this._bounds.getRectangle();
    }

    constructor(texture: Texture) {
        super(texture)
        this._uid = utils.uid();
        this._dragPosition = new Point();
        this._isSelected = false;
        this._isHovered = false;
        this.eventMode = 'dynamic';
    }

    public select() {
        if (this._isSelected)
            return;

        this.tint = new Color(PIECE_SELECTION_TINT);
        this._isSelected = true;
    }

    public deselect() {
        if (!this._isSelected)
            return;

        this.tint = new Color(0xFFFFFF);
        this._isSelected = false;

        if (this._isHovered)
            this.startHover();
    }

    public startDrag(parentPosition: Point) {
        this._dragPosition.set(
            parentPosition.x - this.x,
            parentPosition.y - this.y
        );

        this.select();
    }

    public drag(parentPosition: Point) {
        this.x = parentPosition.x - this._dragPosition.x;
        this.y = parentPosition.y - this._dragPosition.y;
    }

    public endDrag() { }

    public startHover() {
        if (this._isSelected)
            return;

        this._isHovered = true;
        this.tint = new Color(PIECE_HOVER_TINT);
    }

    public endHover() {
        if (this._isSelected)
            return;

        this._isHovered = false;
        this.tint = new Color(0xFFFFFF);
    }
}