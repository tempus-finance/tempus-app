import { BrowserContext, Page, test } from '@playwright/test';
import { metamaskLogin } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { manageDeposit } from '../modules/manage';
import { manageTextFees } from '../modules/manageText';

test.describe.serial('Manage deposit tests', () => {
  let browser: BrowserContext;
  test.beforeAll(async () => {
    browser = await chromiumPersistant();
    await metamaskLogin(browser);
  });

  test('Opens Manage Deposit', async () => {
    const page: Page = await manageDeposit(browser, 'DAI');
    page.close();
  });

  test('Fees & transaction info', async () => {
    await manageTextFees(browser, 'DAI');
  });

  test.afterAll(async () => {
    await browser.close();
  });
});
