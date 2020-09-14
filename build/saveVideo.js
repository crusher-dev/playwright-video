"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveVideo = void 0;
const PageVideoCapture_1 = require("./PageVideoCapture");
exports.saveVideo = (page, savePath, options) => {
    return PageVideoCapture_1.PageVideoCapture.start({ page, savePath, options });
};
//# sourceMappingURL=saveVideo.js.map