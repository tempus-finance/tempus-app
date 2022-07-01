import { BrowserContext } from '@playwright/test';
import { metamaskRegister, metamaskLogin } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { tempusMetamaskConnect } from '../modules/tempushome';

(async () => {
  const browser: BrowserContext = await chromiumPersistant();
  await metamaskRegister(browser);
  await metamaskLogin(browser);
  await tempusMetamaskConnect(browser);
  await browser.close();
})();
