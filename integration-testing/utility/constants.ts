import config from './config';
import { readFileSync } from 'fs';
import { join as pathjoin } from 'path';

const ROOT_PATH = '../../';
const src: string = 'integration-testing/utility/link.txt';

export const USER_DATA_DIR: string = 'integration-testing/utility/user_data';
export const METAMASK_PATH: string = 'integration-testing/mm';
export const METAMASK_ID_PATH: string = 'integration-testing/utility/mm_id.txt';
export const TEMPUS_URL: string = config.CI ?
  readFileSync(pathjoin(__dirname, ROOT_PATH, src)).toString() + ':3000' : 'http://localhost:3000';
export const LOAD_TIMEOUT: number = 600;
export const LOAD_SHORT_TIMEOUT: number = 200;
export const LOAD_LONG_TIMEOUT: number = 1800;
export const BROWSER_WIDTH: number = 1400;
export const BROWSER_HEIGHT: number = 700;
export const LANGUAGE_CODES: string[] = ['en', 'es', 'it'];

