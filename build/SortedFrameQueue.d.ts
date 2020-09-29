/// <reference types="node" />
import { EventEmitter } from 'events';
import { ScreencastFrame } from './ScreencastFrameCollector';
export declare class SortedFrameQueue extends EventEmitter {
    _frames: any[];
    private _size;
    constructor(size?: number);
    private _findInsertionIndex;
    private _emitFrames;
    insert(frame: ScreencastFrame): void;
    drain(): void;
}
