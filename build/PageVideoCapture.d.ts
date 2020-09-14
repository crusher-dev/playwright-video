import { Page } from 'playwright-core';
import { SortedFrameQueue } from './SortedFrameQueue';
import { ScreencastFrameCollector } from './ScreencastFrameCollector';
import { VideoWriter } from './VideoWriter';
export interface CaptureOptions {
    followPopups: boolean;
    fps?: number;
}
interface ConstructorArgs {
    collector: ScreencastFrameCollector;
    queue: SortedFrameQueue;
    page: Page;
    writer: VideoWriter;
}
interface StartArgs {
    page: Page;
    savePath: string;
    options?: CaptureOptions;
}
export declare class PageVideoCapture {
    static start({ page, savePath, options, }: StartArgs): Promise<PageVideoCapture>;
    _collector: ScreencastFrameCollector;
    private _previousFrame?;
    private _queue;
    _stopped: boolean;
    private _writer;
    protected constructor({ collector, queue, page, writer }: ConstructorArgs);
    private _listenForFrames;
    private _writePreviousFrame;
    private _writeFinalFrameUpToTimestamp;
    stop(): Promise<void>;
}
export {};
