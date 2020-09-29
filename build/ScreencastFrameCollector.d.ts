/// <reference types="node" />
import { EventEmitter } from 'events';
import { CDPSession, Page } from 'playwright-core';
import { CaptureOptions } from './PageVideoCapture';
export interface ScreencastFrame {
    data: Buffer;
    received: number;
    timestamp: number;
}
export declare class ScreencastFrameCollector extends EventEmitter {
    static create(originalPage: Page, options?: CaptureOptions): Promise<ScreencastFrameCollector>;
    _clients: [CDPSession?];
    private _originalPage;
    private _stoppedTimestamp;
    private _endedPromise;
    _followPopups: boolean;
    protected constructor(page: Page, options: CaptureOptions);
    private _popupFollower;
    private _installPopupFollower;
    private _uninstallPopupFollower;
    private _buildClient;
    private _getActiveClient;
    private _listenForFrames;
    private _activatePage;
    private _deactivatePage;
    start(): Promise<void>;
    stop(): Promise<number>;
}
