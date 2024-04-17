import { Viewport } from 'pixi-viewport';
import { PuzzlePiece } from './puzzle-piece.ts';
import { SelectionBox } from './selection-box.ts';
import { Assets, Container, FederatedPointerEvent, Rectangle, Texture } from 'pixi.js';

export class Puzzle extends Container {
    private readonly _viewport: Viewport;
    private readonly _selectionBox: SelectionBox;
    private readonly _pieces: Map<number, PuzzlePiece>;
    private _activeDraggable: PuzzlePiece | null;
    private _isGroupDragging: boolean;

    public get activeDraggable() {
        return this._activeDraggable;
    }

    public get pieces() {
        return this._pieces;
    }

    constructor(viewport: Viewport, selectionBox: SelectionBox) {
        super();
        this.sortableChildren = true;
        this.interactiveChildren = true;
        this.eventMode = 'dynamic';
        this._pieces = new Map();
        this._activeDraggable = null;
        this._isGroupDragging = false;
        this._viewport = viewport;
        this._viewport.addChild(this);
        this._selectionBox = selectionBox;
        this.handleDrag = this.handleDrag.bind(this);

        this._setupEvents();
        this._createPieces('puzzle.png');
    }

    private _setupEvents() {
        this.on('pointerdown', this.handleDragStart.bind(this));
        this.on('pointerup', this.handleDragEnd.bind(this));
        this.on('pointerupoutside', this.handleDragEnd.bind(this));
        this.on('pointerover', this.handleHoverStart.bind(this));
        this.on('pointerout', this.handleHoverEnd.bind(this));
    }

    private _createPieces(imagePath: string) {
        const gap = 15;
        const size = 100;

        Assets.load(imagePath).then((texture) => {
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

    private handleDragStart(event: FederatedPointerEvent): void {
        if (event.button !== 0)
            return;

        if (!(event.target instanceof PuzzlePiece))
            return;

        event.stopPropagation();
        const parentPosition = event.getLocalPosition(this._viewport);
        this._activeDraggable = this._pieces.get(event.target.uid) || null;        
        
        if (!this._activeDraggable)
            return;

        if (this.activeDraggable?.isSelected) {
            for (const piece of this.pieces.values()) {
                if (!piece.isSelected)
                    continue;

                this.setChildIndex(piece, this.pieces.size - 1);
                piece.startDrag(parentPosition);
            }

            this._isGroupDragging = true;
        } else {
            for (const piece of this.pieces.values()) {
                if (!piece.isSelected)
                    continue;

                piece.deselect();
            }

            this.setChildIndex(this._activeDraggable, this.pieces.size - 1);
            this.activeDraggable?.startDrag(parentPosition);
            this._isGroupDragging = false;
        }

        this._viewport.on('pointermove', this.handleDrag);
    }

    private handleDrag(event: FederatedPointerEvent) {
        if (!this._activeDraggable)
            return;

        const parentPosition = event.getLocalPosition(this._viewport);

        for (const piece of this.pieces.values()) {
            if (!piece.isSelected)
                continue;

            piece.drag(parentPosition);
        }
    }

    private handleDragEnd(event: FederatedPointerEvent) {
        if (!this._activeDraggable)
            return;

        event.stopPropagation();
        this._viewport.off('pointermove', this.handleDrag);

        for (const piece of this.pieces.values()) {
            if (!piece.isSelected)
                continue;

            piece.endDrag();
        }

        !this._isGroupDragging && this._activeDraggable.deselect();
        this._activeDraggable = null;
    }

    private handleHoverStart(event: FederatedPointerEvent) {
        if (this._activeDraggable || this._selectionBox.isActive)
            return;

        if (!(event.target instanceof PuzzlePiece))
            return;

        event.target.startHover();
    }

    private handleHoverEnd(event: FederatedPointerEvent) {
        if (this._activeDraggable || this._selectionBox.isActive)
            return;

        if (!(event.target instanceof PuzzlePiece))
            return;

        event.target.endHover();
    }
}