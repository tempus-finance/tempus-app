import { test, BrowserContext } from '@playwright/test';
import { metamaskLogin } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { manageButtonsText } from '../modules/manageText';

test.describe.serial('Manage text', () => {
    let browser: BrowserContext;
    test.beforeAll(async () => {
        browser = await chromiumPersistant();
        await metamaskLogin(browser);
    });

    /*
    test('Disabled buttons when no deposit is made', async () => { // comment out (don't skip) if you're testing with deposit
        await manageDisabledButtons(browser, 'USDC');
    });
    */

    test('USDC manage tab buttons, english', async () => {
        await manageButtonsText(browser, 'USDC', 'en');
    });

    test('DAI manage tab buttons, english', async () => {
        await manageButtonsText(browser, 'DAI', 'en');
    });

    test.afterAll(async () => {
        await browser.close();
    });
});