import { test, expect, BrowserContext, Page } from '@playwright/test';
import { metamaskLogin, METAMASK_CHROME_URL } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { ETH_NETWORK, FTM_NETWORK, tempusNetworkChange } from '../modules/network';

test.describe.serial('Metamask and network tests', () => {
  let browser: BrowserContext;
  test.beforeAll(async () => {
    browser = await chromiumPersistant();
    await metamaskLogin(browser);
  });

  test('Is logged into metamask', async () => {
    const tabMetamask: Page = await browser.newPage();
    await tabMetamask.goto(METAMASK_CHROME_URL);

    await expect(tabMetamask.locator('button:has-text("Buy")')).toBeDefined();
    await tabMetamask.close();
  });

  test('Change to Fantom network', async () => {
    await tempusNetworkChange(browser, FTM_NETWORK.name);
  });

  test('Change to ETH network', async () => {
    await tempusNetworkChange(browser, ETH_NETWORK.name);
  });

  test.afterAll(async () => {
    await browser.close();
  });
});
