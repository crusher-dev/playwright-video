/// <reference types="node" />
import { EventEmitter } from 'events';
import { CaptureOptions } from './PageVideoCapture';
export declare class VideoWriter extends EventEmitter {
    static create(savePath: string, options?: CaptureOptions): Promise<VideoWriter>;
    private _endedPromise;
    private _framesPerSecond;
    private _receivedFrame;
    private _stopped;
    private _stream;
    protected constructor(savePath: string, options?: CaptureOptions);
    private _writeVideo;
    stop(): Promise<void>;
    write(data: Buffer, durationSeconds?: number): void;
}
