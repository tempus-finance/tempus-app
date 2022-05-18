import { test, expect, BrowserContext } from '@playwright/test';
import { metamaskLogin, metamaskLogoff } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { tempusCommunity, tempusFiatCryptoButton, tempusManageAppears, tempusNewRow } from '../modules/tempushome';
import { manageButtonsText, manageDisabledButtons } from '../modules/manageText';


test.describe('development branch', () => {
    let browser: BrowserContext;
    test.beforeAll(async () => {
        browser = await chromiumPersistant();
        await metamaskLogin(browser);
    });

    test('T1', async () => {
        //await tempusCommunity(browser, 'en');
    });

    test.afterAll(async () => {
        await browser.close();
    });
});
