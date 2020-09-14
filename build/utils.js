"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensurePageType = exports.ensureFfmpegPath = exports.getFfmpegPath = exports.getFfmpegFromModule = void 0;
const fluent_ffmpeg_1 = require("fluent-ffmpeg");
exports.getFfmpegFromModule = () => {
    try {
        const ffmpeg = require('@ffmpeg-installer/ffmpeg'); // eslint-disable-line @typescript-eslint/no-var-requires
        if (ffmpeg.path) {
            return ffmpeg.path;
        }
    }
    catch (e) { } // eslint-disable-line no-empty
    return null;
};
exports.getFfmpegPath = () => {
    if (process.env.FFMPEG_PATH) {
        return process.env.FFMPEG_PATH;
    }
    return exports.getFfmpegFromModule();
};
exports.ensureFfmpegPath = () => {
    const ffmpegPath = exports.getFfmpegPath();
    if (!ffmpegPath) {
        throw new Error('pw-video: FFmpeg path not set. Set the FFMPEG_PATH env variable or install @ffmpeg-installer/ffmpeg as a dependency.');
    }
    fluent_ffmpeg_1.setFfmpegPath(ffmpegPath);
};
exports.ensurePageType = (page) => {
    const context = page.context();
    if (!context.newCDPSession) {
        throw new Error('pw-video: page context must be chromium');
    }
};
//# sourceMappingURL=utils.js.map