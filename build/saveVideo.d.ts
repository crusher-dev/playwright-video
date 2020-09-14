import { Page } from 'playwright-core';
import { CaptureOptions, PageVideoCapture } from './PageVideoCapture';
export declare const saveVideo: (page: Page, savePath: string, options?: CaptureOptions) => Promise<PageVideoCapture>;
