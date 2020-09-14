"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageVideoCapture = void 0;
const debug_1 = __importDefault(require("debug"));
const SortedFrameQueue_1 = require("./SortedFrameQueue");
const ScreencastFrameCollector_1 = require("./ScreencastFrameCollector");
const VideoWriter_1 = require("./VideoWriter");
const debug = debug_1.default('pw-video:PageVideoCapture');
class PageVideoCapture {
    constructor({ collector, queue, page, writer }) {
        // public for tests
        this._stopped = false;
        this._collector = collector;
        this._queue = queue;
        this._writer = writer;
        this._writer.on('ffmpegerror', (error) => {
            debug(`stop due to ffmpeg error "${error.trim()}"`);
            this.stop();
        });
        page.on('close', () => this.stop());
        this._listenForFrames();
    }
    static async start({ page, savePath, options, }) {
        debug('start');
        const collector = await ScreencastFrameCollector_1.ScreencastFrameCollector.create(page, options);
        const queue = new SortedFrameQueue_1.SortedFrameQueue();
        const writer = await VideoWriter_1.VideoWriter.create(savePath, options);
        const capture = new PageVideoCapture({ collector, queue, page, writer });
        await collector.start();
        return capture;
    }
    _listenForFrames() {
        this._collector.on('screencastframe', (screencastFrame) => {
            debug(`collected frame from screencast: ${screencastFrame.timestamp}`);
            this._queue.insert(screencastFrame);
        });
        this._queue.on('sortedframes', (frames) => {
            debug(`received ${frames.length} frames from queue`);
            frames.forEach((frame) => this._writePreviousFrame(frame));
        });
    }
    _writePreviousFrame(currentFrame) {
        // write the previous frame based on the duration between it and the current frame
        if (this._previousFrame) {
            const durationSeconds = currentFrame.timestamp - this._previousFrame.timestamp;
            this._writer.write(this._previousFrame.data, durationSeconds);
        }
        this._previousFrame = currentFrame;
    }
    _writeFinalFrameUpToTimestamp(stoppedTimestamp) {
        if (!this._previousFrame)
            return;
        // write the final frame based on the duration between it and when the screencast was stopped
        debug('write final frame');
        const durationSeconds = stoppedTimestamp - this._previousFrame.timestamp;
        this._writer.write(this._previousFrame.data, durationSeconds);
    }
    async stop() {
        if (this._stopped)
            return;
        debug('stop');
        this._stopped = true;
        const stoppedTimestamp = await this._collector.stop();
        this._queue.drain();
        this._writeFinalFrameUpToTimestamp(stoppedTimestamp);
        return this._writer.stop();
    }
}
exports.PageVideoCapture = PageVideoCapture;
//# sourceMappingURL=PageVideoCapture.js.map