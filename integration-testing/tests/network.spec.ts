import { test, expect, BrowserContext, Page } from '@playwright/test';
import { METAMASK_ID, metamaskLogin } from '../modules/metamask';
import { tempusNetworkChange, tempusMetamaskConnect } from '../modules/tempushome';
import { chromiumPersistant } from '../modules/browser';

test.describe("POC tests", () => {
    let browser: BrowserContext;
    test.beforeAll(async () => {
        browser = await chromiumPersistant();
        await metamaskLogin(browser);
        await tempusMetamaskConnect(browser);
    })

    test('Logged into metamask', async () => {
        const tabMetamask: Page = await browser.newPage();
        await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#`);

        await expect(tabMetamask.locator('button:has-text("Buy")')).toBeDefined();
        await tabMetamask.close();
    })

    test('Change to Fantom network', async () => {
        await tempusNetworkChange(browser, "Fantom");
    })

    test('Change to ETH network', async () => {
        await tempusNetworkChange(browser, "Ethereum");
    })

    test.afterAll(async () => {
        await browser.close();
    })
})
