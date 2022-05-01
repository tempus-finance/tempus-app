import { test, expect, BrowserContext } from '@playwright/test';
import { metamaskLogin, metamaskLogoff } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { tempusTextHeaders } from '../modules/tempushome';

test.describe('Homepage text matching', () => {
    let browser: BrowserContext;
    test.beforeAll(async () => {
        browser = await chromiumPersistant();
        await metamaskLogin(browser);
    });

    test('Headers, wallet connected', async () => {
        await tempusTextHeaders(browser, true);
    });

    /* DON'T USE .skip! 
    test.skip('Headers, wallet not connected', async () => {
        await metamaskLogoff(browser);
        await tempusTextHeaders(browser, false);
        //await metamaskLogin(browser) not needed if its the last test
    });*/

    test.afterAll(async () => {
        await browser.close();
    });
})
