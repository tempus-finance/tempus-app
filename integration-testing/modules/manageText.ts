import { BrowserContext, expect, Page } from '@playwright/test';
import { manageDeposit } from './manage';
import { Language } from './language';
import { tempusSwitchLanguage } from './tempushome';

export async function manageTextFees(browser: BrowserContext, asset = 'USDC', langCode = 'en'): Promise<void> {
  const page2: Page = await browser.newPage();
  const lang: Language = await tempusSwitchLanguage(page2, langCode);
  await page2.close();
  const page: Page = await manageDeposit(browser, asset);
  const str = 'Fees & transaction info';
  await page.click(`text="${str}"`);
  const content = '.tc__fee-tooltip__content';
  await expect(page.locator(content)).toContainText('Fee');
  await expect(page.locator(content)).toContainText(lang.deposit);
  await expect(page.locator(content)).toContainText(lang.redemption);
  await expect(page.locator(content)).toContainText(lang.earlyRedemption);
  await expect(page.locator(content)).toContainText(lang.swap);
  await expect(page.locator(content)).toContainText('Swap fees will go to Liquidity providers');
  page.close();
}

/*
export async function manageButtonsText(browser: BrowserContext, asset = 'USDC', langCode = 'en'):
  Promise<void> {
  const page: Page = await tempusManageCurrency(browser, asset);
  await page.waitForTimeout(LOAD_SHORT_TIMEOUT);
  const lang: Language = await tempusSwitchLanguage(page, langCode);
  await expect(page.locator('.tc__sidebar-section-title >> nth=0')).toContainText(lang.basic);
  await expect(page.locator('.tc__sidebar-section-title >> nth=1')).toContainText(lang.advanced);
  await expect(page.locator('.tc__sidebar-view-item >> nth=0')).toHaveText(lang.deposit);
  await expect(page.locator('.tc__sidebar-view-item >> nth=1')).toHaveText(lang.withdraw);
  await expect(page.locator('.tc__sidebar-view-item >> nth=2')).toHaveText(lang.mint);
  await expect(page.locator('.tc__sidebar-view-item >> nth=3')).toHaveText(lang.swap);
  await expect(page.locator('.tc__sidebar-view-item >> nth=4')).toHaveText(lang.provideLiquidity);
  await expect(page.locator('.tc__sidebar-view-item >> nth=5')).toHaveText(lang.removeLiquidity);
  await page.close();
}

export async function manageDisabledButtons(browser: BrowserContext, asset = 'USDC', langCode = 'en'):
  Promise<void> {
  const page: Page = await tempusManageCurrency(browser, asset, langCode);
  await expect(page.locator('.disabled')).toHaveCount(4);
  await page.close();
}
*/
