"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortedFrameQueue = void 0;
const debug_1 = __importDefault(require("debug"));
const events_1 = require("events");
const debug = debug_1.default('pw-video:SortedFrameQueue');
// Frames are sorted as they're inserted into the queue. This allows us
// to preserve frames that are sent out of order from CDP instead of discarding them.
// When the queue is full, half of the frames are emitted for processing.
// When we're done working with the queue, we can drain the remaining frames.
class SortedFrameQueue extends events_1.EventEmitter {
    constructor(size) {
        super();
        // public for tests
        this._frames = [];
        this._size = 40;
        if (size) {
            this._size = size;
        }
    }
    _findInsertionIndex(timestamp) {
        if (this._frames.length === 0) {
            return 0;
        }
        let i;
        let frame;
        for (i = this._frames.length - 1; i >= 0; i--) {
            frame = this._frames[i];
            if (timestamp > frame.timestamp) {
                break;
            }
        }
        return i + 1;
    }
    _emitFrames(frames) {
        debug(`emitting ${frames.length} frames`);
        this.emit('sortedframes', frames);
    }
    insert(frame) {
        // If the queue is already full, send half of the frames for processing first
        if (this._frames.length === this._size) {
            const numberOfFramesToSplice = Math.floor(this._size / 2);
            const framesToProcess = this._frames.splice(0, numberOfFramesToSplice);
            this._emitFrames(framesToProcess);
        }
        const insertionIndex = this._findInsertionIndex(frame.timestamp);
        if (insertionIndex === this._frames.length) {
            debug(`inserting frame into queue at end: ${frame.timestamp}`);
            // If this frame is in order, push it
            this._frames.push(frame);
        }
        else {
            debug(`inserting frame into queue at index ${insertionIndex}: ${frame.timestamp}`);
            // If this frame is out of order, splice it in
            this._frames.splice(insertionIndex, 0, frame);
        }
    }
    drain() {
        debug('draining queue');
        // Send all remaining frames for processing
        this._emitFrames(this._frames);
        this._frames = [];
    }
}
exports.SortedFrameQueue = SortedFrameQueue;
//# sourceMappingURL=SortedFrameQueue.js.map