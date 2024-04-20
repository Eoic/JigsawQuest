import { Rectangle } from 'pixi.js';

export interface Selectable {
    get isSelected(): boolean;
    get dimensions(): Rectangle;
    select(): void;
    deselect(): void;
};