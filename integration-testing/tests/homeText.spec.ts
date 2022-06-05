import { test, BrowserContext } from '@playwright/test';
import { metamaskLogin } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { tempusCommunity, tempusFiatCryptoButton, tempusManageAppears, tempusNewRow, tempusTextHeaders } from '../modules/tempushome';

test.describe.serial('Homepage text matching tests', () => {
    let browser: BrowserContext;
    test.beforeAll(async () => {
        browser = await chromiumPersistant();
        await metamaskLogin(browser);
    });

    test('Basic headers', async () => {
        await tempusTextHeaders(browser, false);
    });

    test('Manage button appears on click (italian)', async () => {
        await tempusManageAppears(browser, undefined, 'it');
    });

    test('Tempus home new row appears on click', async () => {
        await tempusNewRow(browser);
    });

    test('Fiat/Crypto button (spanish)', async () => {
        await tempusFiatCryptoButton(browser, 'es');
    });

    test('Tempus home community links (english)', async () => {
        await tempusCommunity(browser, 'en');
    });

    test.afterAll(async () => {
        await browser.close();
    });
})
