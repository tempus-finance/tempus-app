import { test, expect, BrowserContext, Page } from '@playwright/test';
import { metamaskLogin } from '../modules/metamask';
import { tempusManageCurrency, tempusMetamaskConnect } from '../modules/tempushome';
import { chromiumPersistant } from '../modules/browser';

test.describe.serial('Open Manage tabs unit tests', () => {
    let browser: BrowserContext;
    test.beforeAll(async () => {
        browser = await chromiumPersistant();
        await metamaskLogin(browser);
        await tempusMetamaskConnect(browser);
    });

    test("Open manage USDC tab", async () => {
        const tabManage: Page = await tempusManageCurrency(browser, 'USDC');
        await expect(tabManage.locator('text=Total Value Locked')).toBeDefined();
        await tabManage.close();
    });

    test("Open manage DAI tab", async () => {
        const tabManage: Page = await tempusManageCurrency(browser, 'DAI');
        await expect(tabManage.locator('text=Total Value Locked')).toBeDefined();
        await tabManage.close();
    });

    test.afterAll(async () => {
        await browser.close();
    });
});