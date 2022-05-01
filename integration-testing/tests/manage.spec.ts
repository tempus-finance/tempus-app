import { test, expect, BrowserContext, Page } from '@playwright/test';
import { METAMASK_ID, metamaskLogin } from '../modules/metamask';
import { tempusManageCurrency, tempusMetamaskConnect, tempusTextHeaders } from '../modules/tempushome';
import { chromiumPersistant } from '../modules/browser';

test.describe('Open Manage tabs', () => {
    let browser: BrowserContext;
    test.beforeAll(async () => {
        browser = await chromiumPersistant();
        await metamaskLogin(browser);
        await tempusMetamaskConnect(browser);
    });

    test('Logged into metamask', async () => {
        const tabMetamask: Page = await browser.newPage();
        await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#`);

        await expect(tabMetamask.locator('button:has-text("Buy")')).toBeDefined();
        await tabMetamask.close();
    });

    test("Manage USDC", async () => {
        const tabManage: Page = await tempusManageCurrency(browser, 'USDC');
        await expect(tabManage.locator('text=Total Value Locked')).toBeDefined();
        await tabManage.close();
    });

    test("Manage DAI", async () => {
        const tabManage: Page = await tempusManageCurrency(browser, 'DAI');
        await expect(tabManage.locator('text=Total Value Locked')).toBeDefined();
        await tabManage.close();
    });

    test.afterAll(async () => {
        await browser.close();
    });
});