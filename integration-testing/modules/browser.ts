import { BrowserContext, chromium, firefox } from "playwright";
import { join as pathjoin } from 'path';
import {
    USER_DATA_DIR, METAMASK_PATH, BROWSER_WIDTH,
    BROWSER_HEIGHT, LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT
} from '../utility/constants';

const ROOT_PATH: string = '../../';
const EXTENSION_PATH: string = pathjoin(__dirname, ROOT_PATH, METAMASK_PATH);
const USER_DATA_DIR_PATH: string = pathjoin(__dirname, ROOT_PATH, USER_DATA_DIR);

export async function chromiumPersistant(args: {
    slowMo?: number,
    width?: number,
    height?: number,
} = {}): Promise<BrowserContext> {
    return await chromium.launchPersistentContext(USER_DATA_DIR_PATH, {
        headless: false,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`
        ],
        slowMo: args.slowMo ?? LOAD_TIMEOUT,
        viewport: {
            width: args.width ?? BROWSER_WIDTH,
            height: args.height ?? BROWSER_HEIGHT
        },
    });
};
