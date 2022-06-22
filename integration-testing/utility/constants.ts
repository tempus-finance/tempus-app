import config from './config';
export const USER_DATA_DIR: string = 'integration-testing/utility/user_data';
export const METAMASK_PATH: string = 'integration-testing/mm';
export const METAMASK_ID_PATH: string = 'integration-testing/utility/mm_id.txt';
export const TEMPUS_URL: string = config.CI ? 'http://172.20.0.3:3000' : 'http://localhost:3000';
// = config.CI ? 'http://172.20.0.3:3000' :
//   config.LOCALHOST ? 'http://localhost:3000' : 'https://tempus-app-stage.web.app/';
//export const TEMPUS_URL: string = 'https://tempus-app-stage.web.app/';
export const LOAD_TIMEOUT: number = 600;
export const LOAD_SHORT_TIMEOUT: number = 200;
export const LOAD_LONG_TIMEOUT: number = 1800;
export const BROWSER_WIDTH: number = 1400;
export const BROWSER_HEIGHT: number = 700;
export const LANGUAGE_CODES: string[] = ['en', 'es', 'it'];
