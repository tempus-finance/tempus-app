import { metamaskUpdateId, metamaskRetrieveId } from '../modules/metamask';
import { chromiumPersistant } from '../modules/browser';
import { BrowserContext } from 'playwright';


(async () => {
    const browser: BrowserContext = await chromiumPersistant();
    await metamaskUpdateId(browser);
    await browser.close();
})();