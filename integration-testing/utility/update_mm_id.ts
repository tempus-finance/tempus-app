import { BrowserContext } from 'playwright';
import { metamaskUpdateId } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';

(async () => {
  const browser: BrowserContext = await chromiumPersistant();
  await metamaskUpdateId(browser);
  await browser.close();
})();
