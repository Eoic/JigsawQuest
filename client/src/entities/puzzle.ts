import { Viewport } from 'pixi-viewport';
import { PuzzlePiece } from './puzzle-piece.ts';
import { SelectionBox } from './selection-box.ts';
import vertexShader from '../shaders/vertex.vert';
import fragmentShader from '../shaders/fragment.frag';
import { Assets, BaseTexture, Container, FederatedPointerEvent, Rectangle, Texture, Point, Geometry, Mesh, Shader, Program, Graphics, RenderTexture, Sprite, Application } from 'pixi.js';

export class Puzzle extends Container {
    private readonly _viewport: Viewport;
    private readonly _selectionBox: SelectionBox;
    private readonly _pieces: Map<number, PuzzlePiece>;
    private _dragPiece: PuzzlePiece | null;
    private _isGroupDrag: boolean;
    private _app: Application;

    public get pieces() {
        return this._pieces;
    }

    public get dragPiece() {
        return this._dragPiece;
    }

    constructor(app: Application, viewport: Viewport, selectionBox: SelectionBox) {
        super();
        this.sortableChildren = true;
        this.interactiveChildren = true;
        this.eventMode = 'dynamic';
        this._app = app;
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

    private async _createPieces(imagePath: string) {
        Assets.load(imagePath).then((texture: BaseTexture) => {
            const geometry = new Geometry();

            geometry.addAttribute('a_position', [0, 0, 100, 0, 0, 100, 100, 100], 2);
            geometry.addAttribute('a_textureCoord', [0, 0, 1, 0, 0, 1, 1, 1], 2);
            geometry.addIndex([0, 1, 2, 1, 3, 2]);

            const program = new Program(vertexShader, fragmentShader);
            const shader = new Shader(program);
            shader.uniforms.u_sampler = texture;
            const mesh = new Mesh(geometry, shader);
            mesh.scale.set(8, 8);
            mesh.position.set(500, 300);
            this.addChild(mesh);
        }).catch((error) => console.error(error));
        // ---

        // const gap = 15;
        // const rows = 5;
        // const cols = 5;
        
        // Assets.load(imagePath).then((texture: BaseTexture) => {
        //     const pieceWidth = texture.width / rows;
        //     const pieceHeight = texture.height / cols;
        //     const puzzleHalfSize = (gap * (rows - 1) + pieceWidth * cols) / 2;
        //     const offsetX = this._viewport.worldWidth / 2 - puzzleHalfSize;
        //     const offsetY = this._viewport.worldHeight / 2 - puzzleHalfSize;

        //     for (let x = 0; x < cols; x++) {
        //         for (let y = 0; y < rows; y++) {
        //             const rectangle = new Rectangle(pieceWidth * x, pieceHeight * y, pieceWidth, pieceHeight);
        //             const pieceTexture = new Texture(texture, rectangle);
        //             const piece = new PuzzlePiece(pieceTexture);

        //             piece.position.set(
        //                 x * (pieceWidth + gap),
        //                 y * (pieceHeight + gap),
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