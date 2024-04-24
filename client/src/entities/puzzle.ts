import { Viewport } from 'pixi-viewport';
import { PuzzlePiece } from './puzzle-piece.ts';
import { SelectionBox } from './selection-box.ts';
import { Assets, BaseTexture, Container, FederatedPointerEvent, Rectangle, Texture } from 'pixi.js';

export class Puzzle extends Container {
    private readonly _viewport: Viewport;
    private readonly _selectionBox: SelectionBox;
    private readonly _pieces: Map<number, PuzzlePiece>;
    private _dragPiece: PuzzlePiece | null;
    private _isGroupDrag: boolean;

    public get pieces() {
        return this._pieces;
    }

    public get dragPiece() {
        return this._dragPiece;
    }

    constructor(viewport: Viewport, selectionBox: SelectionBox) {
        super();
        this.sortableChildren = true;
        this.interactiveChildren = true;
        this.eventMode = 'dynamic';
        this._pieces = new Map();
        this._dragPiece = null;
        this._isGroupDrag = false;
        this._viewport = viewport;
        this._viewport.addChild(this);
        this._selectionBox = selectionBox;

        this._setupEvents();
        this._createPieces('puzzle.png');
    }

    private _setupEvents() {
        this.on('pointerdown', this.handleDragStart);
        this.on('pointerup', this.handleDragEnd);
        this.on('pointerupoutside', this.handleDragEnd);
        this.on('pointerover', this.handleHoverStart);
        this.on('pointerout', this.handleHoverEnd);
    }

    private _createPieces(imagePath: string) {
        const gap = 15;
        const size = 100;

        Assets.load(imagePath).then((texture: BaseTexture) => {
            const puzzleHalfSize = (gap * 9 + 100 * 10) / 2;
            const offsetX = this._viewport.worldWidth / 2 - puzzleHalfSize;
            const offsetY = this._viewport.worldHeight / 2 - puzzleHalfSize;

            for (let x = 0; x < 10; x++) {
                for (let y = 0; y < 10; y++) {
                    const rectangle = new Rectangle(size * x, size * y, size, size);
                    const pieceTexture = new Texture(texture, rectangle);
                    const piece = new PuzzlePiece(pieceTexture);

                    piece.position.set(
                        x * (size + gap),
                        y * (size + gap),
                    );

                    this.addChild(piece);
                    this._pieces.set(piece.uid, piece);
                }
            }

            this.position.set(offsetX, offsetY);
            this.calculateBounds();
            this.getBounds();
        }).catch((error) => console.error(error));
    }

    private handleDragStart = (event: FederatedPointerEvent) => {
        if (event.button !== 0)
            return;

        if (!(event.target instanceof PuzzlePiece))
            return;

        event.stopPropagation();
        const parentPosition = event.getLocalPosition(this._viewport);
        this._dragPiece = this._pieces.get(event.target.uid) || null;

        if (!this._dragPiece)
            return;

        if (this._dragPiece.isSelected) {
            for (const piece of this.pieces.values()) {
                if (!piece.isSelected)
                    continue;

                this.setChildIndex(piece, this.pieces.size - 1);
                piece.startDrag(parentPosition);
            }

            this._isGroupDrag = true;
        } else {
            for (const piece of this.pieces.values()) {
                if (!piece.isSelected)
                    continue;

                piece.deselect();
            }

            this.setChildIndex(this._dragPiece, this.pieces.size - 1);
            this._dragPiece.startDrag(parentPosition);
            this._isGroupDrag = false;
        }

        this._viewport.on('pointermove', this.handleDrag);
    }

    private handleDrag = (event: FederatedPointerEvent) => {
        if (!this._dragPiece)
            return;

        const parentPosition = event.getLocalPosition(this._viewport);

        for (const piece of this.pieces.values()) {
            if (!piece.isSelected)
                continue;

            piece.drag(parentPosition);
        }
    }

    private handleDragEnd = (event: FederatedPointerEvent) => {
        if (!this._dragPiece)
            return;

        event.stopPropagation();
        this._viewport.off('pointermove', this.handleDrag);

        for (const piece of this.pieces.values()) {
            if (!piece.isSelected)
                continue;

            piece.endDrag();
        }

        !this._isGroupDrag && this._dragPiece.deselect();
        this._dragPiece = null;
    }

    private handleHoverStart = (event: FederatedPointerEvent) => {
        if (this._dragPiece || this._selectionBox.isActive)
            return;

        if (!(event.target instanceof PuzzlePiece))
            return;

        event.target.startHover();
    }

    private handleHoverEnd = (event: FederatedPointerEvent) => {
        if (this._dragPiece || this._selectionBox.isActive)
            return;

        if (!(event.target instanceof PuzzlePiece))
            return;

        event.target.endHover();
    }
}