"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoWriter = void 0;
const debug_1 = __importDefault(require("debug"));
const events_1 = require("events");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const stream_1 = require("stream");
const utils_1 = require("./utils");
const debug = debug_1.default('pw-video:VideoWriter');
class VideoWriter extends events_1.EventEmitter {
    constructor(savePath, options) {
        super();
        this._framesPerSecond = 25;
        this._receivedFrame = false;
        this._stopped = false;
        this._stream = new stream_1.PassThrough();
        utils_1.ensureFfmpegPath();
        if (options && options.fps) {
            this._framesPerSecond = options.fps;
        }
        this._writeVideo(savePath);
    }
    static async create(savePath, options) {
        await fs_extra_1.ensureDir(path_1.dirname(savePath));
        return new VideoWriter(savePath, options);
    }
    _writeVideo(savePath) {
        debug(`write video to ${savePath}`);
        this._endedPromise = new Promise((resolve, reject) => {
            fluent_ffmpeg_1.default({ source: this._stream, priority: 20 })
                .videoCodec('libx264')
                .inputFormat('image2pipe')
                .inputFPS(this._framesPerSecond)
                .outputOptions('-preset ultrafast')
                .outputOptions('-pix_fmt yuv420p')
                .on('error', (e) => {
                this.emit('ffmpegerror', e.message);
                // do not reject as a result of not having frames
                if (!this._receivedFrame &&
                    e.message.includes('pipe:0: End of file')) {
                    resolve();
                    return;
                }
                reject(`pw-video: error capturing video: ${e.message}`);
            })
                .on('end', () => {
                resolve();
            })
                .save(savePath);
        });
    }
    stop() {
        if (this._stopped) {
            return this._endedPromise;
        }
        this._stopped = true;
        this._stream.end();
        return this._endedPromise;
    }
    write(data, durationSeconds = 1) {
        this._receivedFrame = true;
        const numFrames = Math.max(Math.round(durationSeconds * this._framesPerSecond), 1);
        debug(`write ${numFrames} frames for duration ${durationSeconds}s`);
        for (let i = 0; i < numFrames; i++) {
            this._stream.write(data);
        }
    }
}
exports.VideoWriter = VideoWriter;
//# sourceMappingURL=VideoWriter.js.map