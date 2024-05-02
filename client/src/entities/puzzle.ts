// https://github.com/Draradech/jigsaw

import { Viewport } from 'pixi-viewport';
import { PuzzlePiece } from './puzzle-piece.ts';
import { SelectionBox } from './selection-box.ts';
import { Assets, BaseTexture, Container, FederatedPointerEvent, Rectangle, Texture, Point, Sprite } from 'pixi.js';

// Color segmentation.
// const colorKeys = []; // Array to store unique color values from the mask

// // Assuming you can identify unique color values from the mask image
// for (let y = 0; y < maskTexture.height; y++) {
//     for (let x = 0; x < maskTexture.width; x++) {
//         const color = maskTexture.baseTexture.pixels[(y * maskTexture.width + x) * 4]; // Access pixel color data
//         if (!colorKeys.includes(color)) {
//             colorKeys.push(color);
//         }
//     }
// }

// for (const color of colorKeys) {
//     // Create a temporary render target to isolate the color
//     const renderTexture = PIXI.RenderTexture.create({ width: maskTexture.width, height: maskTexture.height });

//     // Render only pixels matching the current color to the render target
//     const filter = new PIXI.filters.ColorMatrixFilter();
//     filter.matrix = [
//         1, 0, 0, 0, 0, // Red channel remains unchanged
//         0, 0, 0, 0, 0, // Green channel set to 0
//         0, 0, 0, 0, 0, // Blue channel set to 0
//         0, 0, 0, 1, 0  // Alpha channel remains unchanged
//     ];
//     maskSprite.filters = [filter];
//     app.renderer.render(maskSprite, renderTexture);
//     maskSprite.filters = null; // Clear filter

//     // Rest of the process remains similar to the previous approach
//     mainSprite.mask = new PIXI.Sprite(PIXI.Texture.from(renderTexture));
//     // ... (render, create piece texture and sprite, add to scene)
// }


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
        this._createPieces('puzzle.png', 'mask-draft.png');
    }

    private _setupEvents() {
        this.on('pointerdown', this.handleDragStart);
        this.on('pointerup', this.handleDragEnd);
        this.on('pointerupoutside', this.handleDragEnd);
        this.on('pointerover', this.handleHoverStart);
        this.on('pointerout', this.handleHoverEnd);
    }

    private async _createPieces(imagePath: string, maskPath: string) {
        const puzzleTexture = await Assets.load(imagePath);
        const maskTexture = await Assets.load(maskPath);

        const puzzleSprite = new Sprite(puzzleTexture);
        const maskSprite = new Sprite(maskTexture);
        maskSprite.renderable = false;
        puzzleSprite.mask = maskSprite;

        this.addChild(puzzleSprite);
        this.addChild(maskSprite)

        // const gap = 15;
        // const size = 100;

        // Assets.load(imagePath).then((texture: BaseTexture) => {
        //     const puzzleHalfSize = (gap * 9 + 100 * 10) / 2;
        //     const offsetX = this._viewport.worldWidth / 2 - puzzleHalfSize;
        //     const offsetY = this._viewport.worldHeight / 2 - puzzleHalfSize;

        //     for (let x = 0; x < 10; x++) {
        //         for (let y = 0; y < 10; y++) {
        //             const rectangle = new Rectangle(size * x, size * y, size, size);
        //             const pieceTexture = new Texture(texture, rectangle);
        //             const piece = new PuzzlePiece(pieceTexture);

        //             piece.position.set(
        //                 x * (size + gap),
        //                 y * (size + gap),
        //             );

        //             this.addChild(piece);
        //             this._pieces.set(piece.uid, piece);
        //         }
        //     }

        //     this.position.set(offsetX, offsetY);
        //     this.calculateBounds();
        //     this.getBounds();
        // }).catch((error) => console.error(error));
    }

    private handleDragStart = (event: FederatedPointerEvent) => {
        if (event.button !== 0 || !(event.target instanceof PuzzlePiece) || this.captureDragPiece(event.target) === null)
            return;

        event.stopPropagation();

        const parentPosition = event.getLocalPosition(this._viewport);
        this._dragPiece!.isSelected ? this.startDragGroup(parentPosition) : this.startDragSingle(parentPosition);
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
        if (this.isHoverEventValid(event))
            (event.target as PuzzlePiece).startHover();
    }

    private handleHoverEnd = (event: FederatedPointerEvent) => {
        if (this.isHoverEventValid(event))
            (event.target as PuzzlePiece).endHover();
    }

    private captureDragPiece(target: PuzzlePiece) {
        this._dragPiece = this._pieces.get(target.uid) || null;
        return this._dragPiece;
    }

    private startDragSingle(parentPosition: Point) {
        for (const piece of this.pieces.values()) {
            if (!piece.isSelected)
                continue;

            piece.deselect();
        }

        this.setChildIndex(this._dragPiece!, this.pieces.size - 1);
        this._dragPiece!.startDrag(parentPosition);
        this._isGroupDrag = false;
    }

    private startDragGroup(parentPosition: Point) {
        const selectedPieces = []
        const totalPieces = this.pieces.size - 1;

        for (const piece of this.pieces.values()) {
            if (!piece.isSelected)
                continue;
            
            selectedPieces.push(piece);
            piece.startDrag(parentPosition);
        }

        selectedPieces
            .sort((left, right) => this.getChildIndex(left) > this.getChildIndex(right) ? -1 : 1)
            .forEach((piece, index) => this.setChildIndex(piece, totalPieces - index))
        
        this._isGroupDrag = true;
    }

    private isHoverEventValid(event: FederatedPointerEvent) {
        return !this._dragPiece && !this._selectionBox.isActive && event.target instanceof PuzzlePiece;
    }
}