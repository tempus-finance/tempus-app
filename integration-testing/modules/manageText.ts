import { Browser, BrowserContext, expect, Page } from '@playwright/test';
import { TEMPUS_URL, LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT }
    from "../utility/constants";
import { langaugeSwitch, Language, languageGenerator } from './language';
import { tempusManageCurrency } from "./tempushome";


export async function manageButtonsText(browser: BrowserContext, asset: string = 'USDC', langCode: string = 'en'):
    Promise<void> {
    const lang: Language = languageGenerator(langCode);
    const page: Page = await tempusManageCurrency(browser, asset);
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

export async function manageDisabledButtons(browser: BrowserContext, asset: string = 'USDC', langCode: string = 'en'):
    Promise<void> {
    const page: Page = await tempusManageCurrency(browser, asset, langCode);
    await expect(page.locator('.disabled')).toHaveCount(4);
    await page.close();
}
