import { BrowserContext, Page, test, expect } from '@playwright/test'
import { tempusSwitchLanguage } from '../modules/tempushome';
import { metamaskLogin, METAMASK_CHROME_URL } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { TEMPUS_URL } from '../utility/constants';

test.describe.serial("Language switching tests", () => {
  let browser: BrowserContext;
  test.beforeAll(async () => {
    browser = await chromiumPersistant();
    await metamaskLogin(browser);
  });

  test('English, Spanish, Italian languages are included', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await page.click(`text="Settings"`);
    await page.click(`text="English"`);
    await expect(page.locator(`text="English"`)).toBeDefined();
    await expect(page.locator(`text="Español"`)).toBeDefined();
    await expect(page.locator(`text="Italiano"`)).toBeDefined();

    page.close();
  })

  /* UNCOMMENT AFTER LANGUAGE CHANGING IS ADDED

  test('English to Spanish', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await tempusSwitchLanguage(page, 'es', 'en');
    page.close();
  });

  test('Spanish to Italian', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await tempusSwitchLanguage(page, 'it', 'es');
    page.close();
  });

  test('Persistancy', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await page.click(`text="Settings"`);
    await expect(page.locator(`text="Italiano"`)).toBeDefined();
    page.close();
  });

  test('Italian to English', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await tempusSwitchLanguage(page, 'it', 'en');
    page.close();
  });

  test('English to Italian to Spanish', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await tempusSwitchLanguage(page, 'it', 'en');
    await tempusSwitchLanguage(page, 'es', 'it');
    page.close();
  });*/

  test.afterAll(async () => {
    await browser.close();
  });
});