"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoWriter = void 0;
const debug_1 = __importDefault(require("debug"));
const events_1 = require("events");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const stream_1 = require("stream");
const utils_1 = require("./utils");
const fs = __importStar(require("fs"));
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
            const writeStream = fs.createWriteStream(savePath + ".raw");
            this._stream.pipe(writeStream);
            this._stream.on('error', function (e) {
                this.emit('ffmpegerror', e.message);
                // do not reject as a result of not having frames
                if (!this._receivedFrame &&
                    e.message.includes('pipe:0: End of file')) {
                    resolve();
                    return;
                }
                reject(`pw-video: error capturing video: ${e.message}`);
            });
            this._stream.on('end', function () {
                resolve();
            });
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