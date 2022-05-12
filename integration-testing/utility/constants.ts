export const USER_DATA_DIR: string = 'integration-testing/utility/user_data';
export const METAMASK_PATH: string = 'integration-testing/mm';
export const TEMPUS_URL: string
    = process.env.CI ? 'localhost:3000' : 'https://tempus-app-stage.web.app/';
export const LOAD_TIMEOUT: number = 600;
export const LOAD_SHORT_TIMEOUT: number = 200;
export const LOAD_LONG_TIMEOUT: number = 1800;
export const BROWSER_WIDTH: number = 1400;
export const BROWSER_HEIGHT: number = 700;
export const LANGUAGE_CODES: string[] = ['en', 'es', 'it'];
