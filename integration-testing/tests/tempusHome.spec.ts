import { BrowserContext, Page, test, expect } from '@playwright/test';
import { metamaskLogin } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { TEMPUS_URL } from '../utility/constants';

test.describe.serial('Tempus Homepage tests', () => {
  let browser: BrowserContext;
  test.beforeAll(async () => {
    browser = await chromiumPersistant();
    await metamaskLogin(browser);
  });

  test('Click to switch tabs (english)', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await page.click('text="Markets"');
    await expect(page).toHaveURL(`${TEMPUS_URL}`);
    await page.click('text="LP"');
    await expect(page).toHaveURL(`${TEMPUS_URL}lp`);
    await page.click('text="Portfolio"');
    await expect(page).toHaveURL(`${TEMPUS_URL}portfolio/overview`);
    await page.close();
  });

  test('Click to switch filter (english)', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await page.click('text="Filter"');
    await page.click('text=/^Active\\ \\(/');
    await page.click('text=/^Matured\\ \\(/');
    await page.click('text=/^Inactive\\ \\(/');
    await page.close();
  });

  test('Click to switch sorting (english)', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);

    await page.click('text="Filter"');
    await page.click('text=/^Inactive\\ \\(/');
    await page.mouse.click(10, 10);
    // remove this when z-index problem is fixed

    await page.click('text="Sort"');
    await page.click('text="A-Z"');
    await page.click('text="Maturity"');
    await page.click('text="TVL"');
    await page.click('text="APR %"');
    await page.click('text="Balance"');

    await page.close();
  });

  test('Portofolio overview - Current Value', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await page.click('text="Portfolio"');
    await page.click('text="Overview"');
    await expect(page.locator('.tc__app__portfolio-box >> nth=0')).toContainText('Current Value');
    await page.close();
  });

  test('Portofolio overview - Yield Earned', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await page.click('text="Portfolio"');
    await page.click('text="Overview"');
    await expect(page.locator('.tc__app__portfolio-box >> nth=1')).toContainText('Yield Earned');
    await page.close();
  });

  test('Portofolio overview - Projected Yield', async () => {
    const page: Page = await browser.newPage();
    await page.goto(TEMPUS_URL);
    await page.click('text="Portfolio"');
    await page.click('text="Overview"');
    await expect(page.locator('.tc__app__portfolio-box >> nth=2')).toContainText('Projected Yield');
    await page.close();
  });

  test.afterAll(async () => {
    await browser.close();
  });
});
