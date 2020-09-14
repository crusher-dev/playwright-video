"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreencastFrameCollector = void 0;
const debug_1 = __importDefault(require("debug"));
const events_1 = require("events");
const utils_1 = require("./utils");
const debug = debug_1.default('pw-video:ScreencastFrameCollector');
class ScreencastFrameCollector extends events_1.EventEmitter {
    constructor(page, options) {
        super();
        this._originalPage = page;
        this._clients = [];
        this._followPopups = options ? options.followPopups : false;
        this._popupFollower = this._popupFollower.bind(this);
    }
    static async create(originalPage, options) {
        utils_1.ensurePageType(originalPage);
        const collector = new ScreencastFrameCollector(originalPage, options);
        return collector;
    }
    async _popupFollower(popup) {
        await this._activatePage(popup);
        // for tests
        this.emit('popupFollowed');
        popup.once('close', async () => {
            await this._deactivatePage(popup);
        });
    }
    _installPopupFollower(page) {
        page.on('popup', this._popupFollower);
    }
    _uninstallPopupFollower(page) {
        page.off('popup', this._popupFollower);
    }
    async _buildClient(page) {
        const context = page.context();
        const client = await context.newCDPSession(page);
        return client;
    }
    _getActiveClient() {
        return this._clients[this._clients.length - 1];
    }
    _listenForFrames(client) {
        this._endedPromise = new Promise((resolve) => {
            client.on('Page.screencastFrame', async (payload) => {
                if (!payload.metadata.timestamp) {
                    debug('skipping frame without timestamp');
                    return;
                }
                if (this._stoppedTimestamp && payload.metadata.timestamp > this._stoppedTimestamp) {
                    debug('all frames received');
                    resolve();
                    return;
                }
                debug(`received frame with timestamp ${payload.metadata.timestamp}`);
                const ackPromise = client.send('Page.screencastFrameAck', {
                    sessionId: payload.sessionId,
                });
                this.emit('screencastframe', {
                    data: Buffer.from(payload.data, 'base64'),
                    received: Date.now(),
                    timestamp: payload.metadata.timestamp,
                });
                try {
                    // capture error so it does not propagate to the user
                    // most likely it is due to the active page closing
                    await ackPromise;
                }
                catch (e) {
                    debug('error sending screencastFrameAck %j', e.message);
                }
            });
        });
    }
    async _activatePage(page) {
        debug('activating page: ', page.url());
        let client;
        try {
            client = await this._buildClient(page);
        }
        catch (e) {
            // capture error so it does not propagate to the user
            // this is most likely due to the page not being open
            // long enough to attach the CDP session
            debug('error building client %j', e.message);
            return;
        }
        const previousClient = this._getActiveClient();
        if (previousClient) {
            await previousClient.send('Page.stopScreencast');
        }
        this._clients.push(client);
        this._listenForFrames(client);
        try {
            await client.send('Page.startScreencast', {
                everyNthFrame: 1,
            });
        }
        catch (e) {
            // capture error so it does not propagate to the user
            // this is most likely due to the page not being open
            // long enough to start recording after attaching the CDP session
            this._deactivatePage(page);
            debug('error activating page %j', e.message);
        }
    }
    async _deactivatePage(page) {
        debug('deactivating page: ', page.url());
        this._clients.pop();
        const previousClient = this._getActiveClient();
        try {
            // capture error so it does not propagate to the user
            // most likely it is due to the original page closing
            await previousClient.send('Page.startScreencast', {
                everyNthFrame: 1,
            });
        }
        catch (e) {
            debug('error reactivating previous page %j', e.message);
        }
    }
    async start() {
        debug('start');
        await this._activatePage(this._originalPage);
        if (this._followPopups) {
            this._installPopupFollower(this._originalPage);
        }
    }
    async stop() {
        if (this._stoppedTimestamp) {
            throw new Error('pw-video: Cannot call stop twice on the same capture.');
        }
        if (this._followPopups) {
            this._uninstallPopupFollower(this._originalPage);
        }
        this._stoppedTimestamp = Date.now() / 1000;
        debug(`stopping screencast at ${this._stoppedTimestamp}`);
        // Make sure stopping takes no longer than 1s in cases when the screencast API
        // doesn't emit frames all the way up to the stopped timestamp.
        await Promise.race([
            this._endedPromise,
            new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);
        try {
            debug('detaching client');
            for (const client of this._clients) {
                await client.detach();
            }
        }
        catch (e) {
            debug('error detaching client', e.message);
        }
        debug('stopped');
        return this._stoppedTimestamp;
    }
}
exports.ScreencastFrameCollector = ScreencastFrameCollector;
//# sourceMappingURL=ScreencastFrameCollector.js.map