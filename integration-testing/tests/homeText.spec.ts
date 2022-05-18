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

    test('Manage button appears on click (english)', async () => {
        await tempusManageAppears(browser, undefined, 'en');
    });

    test('Tempus home new row appears on click (english)', async () => {
        await tempusNewRow(browser);
    });

    test('Fiat/Crypto button (english)', async () => {
        await tempusFiatCryptoButton(browser, 'en');
    });

    test('Tempus home community links (english)', async () => {
        await tempusCommunity(browser, 'en');
    });

    test.afterAll(async () => {
        await browser.close();
    });
})
