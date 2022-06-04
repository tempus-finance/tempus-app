import { BrowserContext } from '@playwright/test';
import { metamaskRegister, metamaskLogin, metamaskAddETHfork, metamaskAccountsAddAll, metamaskAccountSwitch } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { tempusMetamaskConnect } from '../modules/tempushome';
import { ETH_NETWORK, tempusNetworkChange } from '../modules/network';

(async () => {
  const browser: BrowserContext = await chromiumPersistant();
  await metamaskRegister(browser);
  await metamaskLogin(browser);
  await tempusMetamaskConnect(browser);
  // TODO: add all metamask accounts and switch to 0, currently not needed
  await metamaskAddETHfork(browser);
  await metamaskAccountsAddAll(browser);
  await metamaskAccountSwitch(browser, 1);
  await tempusNetworkChange(browser, ETH_NETWORK.name);
  await browser.close();
})();