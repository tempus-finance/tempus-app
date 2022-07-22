import { BrowserContext, Page } from 'playwright';
import { tempusManageCurrency } from './tempushome';

export async function manageDeposit(browser: BrowserContext, asset = 'USDC'): Promise<Page> {
  const page: Page = await tempusManageCurrency(browser, asset);
  await page.click('button :has-text("Make Deposit")');
  return page;
}
