import { BrowserContext } from '@playwright/test';
import { metamaskRegister, metamaskLogin } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { tempusMetamaskConnect } from '../modules/tempushome';

(async () => {
  const browser: BrowserContext = await chromiumPersistant();
  await metamaskRegister(browser);
  console.log('Metamask account registered');
  await metamaskLogin(browser);
  await tempusMetamaskConnect(browser);
  console.log('Successful connection metamask-tempus');
  // TODO: add all metamask accounts and switch to 0, currently not needed
  await browser.close();
})();