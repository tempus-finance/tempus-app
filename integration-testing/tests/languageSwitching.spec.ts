import { BrowserContext, Page, test, expect } from '@playwright/test';
import { metamaskLogin } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { TEMPUS_URL } from '../utility/constants';

test.describe.serial('Language switching tests', () => {
  let browser: BrowserContext;
  test.beforeAll(async () => {
    browser = await chromiumPersistant();
    await metamaskLogin(browser);
  });

  test('English, Spanish, Italian languages are included', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await page.click('text="Settings"');
    await page.click('text="English"');
    await expect(page.locator('text="English"')).toBeDefined();
    await expect(page.locator('text="Español"')).toBeDefined();
    await expect(page.locator('text="Italiano"')).toBeDefined();

    page.close();
  });

  test.afterAll(async () => {
    await browser.close();
  });
});
