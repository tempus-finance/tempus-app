import { BrowserContext, expect, Page } from '@playwright/test';
import { TEMPUS_URL, LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT }
    from "../utility/constants";
import { Language, languageGenerator } from './language';
import { tempusNetworkChange } from './network';

export async function tempusMetamaskConnect(browser: BrowserContext):
    Promise<void> {
    const tabTempus: Page = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    await tabTempus.waitForTimeout(LOAD_TIMEOUT);
    if (await tabTempus.locator('text=Connect Wallet').count() == 0) {
        await tabTempus.close();
        return;
    }

    const tabCountBefore: number = await browser.pages().length;
    await tabTempus.click('text=Connect Wallet');
    await tabTempus.click('text=MetaMask');
    await tabTempus.waitForTimeout(LOAD_LONG_TIMEOUT);
    const tabCountAfter: number = await browser.pages().length;

    if (tabCountAfter > tabCountBefore) {
        const mm: Page = await browser.pages().slice(-1)[0];

        await mm.bringToFront();
        await mm.waitForTimeout(LOAD_LONG_TIMEOUT);
        const SELECTOR_NEXT = 'text="Next"';
        await mm.click(SELECTOR_NEXT);

        await mm.click('text="Connect"');
    }
    await tabTempus.close();
}

export async function tempusManageCurrency(browser: BrowserContext, asset: string = 'USDC', langCode: string = 'en'):
    Promise<Page> {
    const lang: Language = languageGenerator(langCode);
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    await tabTempus.click(`svg:has-text("${asset}")`);
    await tabTempus.click(`text="${lang.manage}" >> nth=0`);
    return tabTempus;
}

export async function tempusTextHeaders(browser: BrowserContext, walletConnected: boolean = false, langCode: string = 'en'):
    Promise<void> {
    const lang: Language = languageGenerator(langCode);
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    await tabTempus.waitForTimeout(LOAD_LONG_TIMEOUT); // ?

    await expect(tabTempus.locator('th >> nth=0')).toHaveText(lang.asset);
    await expect(tabTempus.locator('th >> nth=1')).toHaveText(lang.protocol);
    await expect(tabTempus.locator('th >> nth=2')).toHaveText(lang.maturity);
    await expect(tabTempus.locator('th >> nth=3')).toHaveText(lang.fixedApr);
    await expect(tabTempus.locator('th >> nth=4')).toHaveText(lang.tvl);
    if (walletConnected) {
        await expect(tabTempus.locator('th >> nth=5')).toHaveText(lang.balance);
        await expect(tabTempus.locator('th >> nth=6')).toHaveText(lang.availableToDeposit);
    }
    await tabTempus.close();
}

export async function tempusManageAppears(browser: BrowserContext, asset: string = 'USDC', langCode: string = 'en') {
    const lang: Language = languageGenerator(langCode);
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    await tabTempus.click(`svg:has-text("${asset}")`);

    const SELECTOR_MANAGE_BUTTON: string = `.MuiTableRow-root > td:has-text("${lang.manage}")`;

    await expect(tabTempus.locator(SELECTOR_MANAGE_BUTTON)).toBeDefined();
    await tabTempus.close();
}

export async function tempusNewRow(browser: BrowserContext, asset: string = 'USDC') {
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);

    const SELECTOR_ROWS: string = '.MuiTableRow-root';

    const oldRowCount: number = await tabTempus.locator(SELECTOR_ROWS).count();
    await tabTempus.click(`svg:has-text("${asset}")`);

    await expect(tabTempus.locator(SELECTOR_ROWS)).not.toHaveCount(oldRowCount);
    await tabTempus.close();
}

export async function tempusFiatCryptoButton(browser: BrowserContext, langCode: string = 'en') {
    await tempusNetworkChange(browser, 'Ethereum', langCode); // works only on ETH atm, hardcoded ContainText
    const lang: Language = languageGenerator(langCode);
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    await tabTempus.waitForLoadState();
    await tabTempus.waitForTimeout(LOAD_TIMEOUT);

    //await langaugeSwitch(tabTempus, languageGenerator('en'), langCode);
    //page becomes unresponsive

    const SELECTOR_CRYPTO_SWITCH = `.tc__switch__label :text("${lang.crypto}")`;
    const SELECTOR_FIAT_SWITCH = `.tc__switch__label :text("${lang.fiat}")`;
    const SELECTOR_CURRENCY: string = '.MuiTableRow-root >> nth=1 >> td >> nth=5';

    await tabTempus.click(SELECTOR_CRYPTO_SWITCH);
    await expect(tabTempus.locator(SELECTOR_CURRENCY)).toContainText('ETH'); // works on ETH network only for now

    await tabTempus.click(SELECTOR_FIAT_SWITCH);
    await expect(tabTempus.locator(SELECTOR_CURRENCY)).toContainText('$');
    await tabTempus.close();
}

export async function tempusCommunity(browser: BrowserContext, langCode: string = 'en') {
    const lang: Language = languageGenerator(langCode);
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);

    const urls: Map<string, string> = new Map([
        [lang.governance, 'https://forum.tempus.finance/'],
        ['Discord', 'https://discord.com/invite/6gauHECShr'],
        ['Twitter', 'https://twitter.com/tempusfinance'],
        ['GitHub', 'https://github.com/tempus-finance'],
    ]);

    const checkUrl = async (site: string) => {
        await tabTempus.click(`text="${lang.community}"`);
        await tabTempus.click(`text="${site}"`);
        await tabTempus.waitForTimeout(LOAD_SHORT_TIMEOUT);

        const tabNew: Page = await browser.pages().slice(-1)[0];
        const expected_url: string = urls.get(site) ?? "INVALID_URL";
        await tabNew.waitForURL(expected_url);
        //await tabNew.waitForTimeout(LOAD_TIMEOUT);
        await tabNew.close();
    };

    for await (let site of urls.keys()) {
        await checkUrl(site);
    }
    await tabTempus.close();
}
