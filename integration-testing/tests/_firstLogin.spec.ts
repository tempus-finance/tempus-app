import { test, BrowserContext } from '@playwright/test';
import { metamaskRegister, metamaskLogin } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { tempusMetamaskConnect } from '../modules/tempushome';

test.describe.serial('Logins and connections, first unit tests', () => {
    let browser: BrowserContext;
    test.beforeAll(async () => {
        browser = await chromiumPersistant();
    })

    test('Metamask register', async () => {
        await test.setTimeout(60 * 1000);
        await metamaskRegister(browser);
    })

    test('Metamask login', async () => {
        await metamaskLogin(browser);
    })

    test('First metamask - tempus connect', async () => {
        await tempusMetamaskConnect(browser);
    })

    test.afterAll(async () => {
        await browser.close();
    })
});
