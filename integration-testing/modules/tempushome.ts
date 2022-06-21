import { BrowserContext, expect, Page } from '@playwright/test';

import { LOAD_LONG_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_TIMEOUT, TEMPUS_URL } from '../utility/constants';
import { getLangName, Language, languageGenerator } from './language';
import { tempusNetworkChange } from './network';
import { metamaskConfirmConnection } from './metamask';

export async function tempusMetamaskConnect(browser: BrowserContext):
    Promise<void> {
    const tabTempus: Page = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    await tabTempus.waitForTimeout(LOAD_TIMEOUT);
    if (await tabTempus.locator('text=Connect Wallet').count() == 0) {
        await tabTempus.close();
        return;
    }

    await tabTempus.click('text=Connect Wallet');
    const termsAndConds: string = `text=I agree to the Terms & Conditions and Privacy Policy.`; //untested
    if (await tabTempus.locator(termsAndConds).count()) {
        await tabTempus.click(termsAndConds);
    }

    await metamaskConfirmConnection(browser);

    //await tabTempus.click('text=MetaMask');
    await tabTempus.waitForTimeout(LOAD_LONG_TIMEOUT);
    console.log('Successful connection metamask-tempus');
    await tabTempus.close();
}

export async function tempusManageCurrency(browser: BrowserContext, asset: string = 'USDC', langCode: string = 'en'):
    Promise<Page> {
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    const lang: Language = await tempusSwitchLanguage(tabTempus, langCode);
    await tabTempus.click(`.MuiTableCell-root >> svg:has-text("${asset}")`);
    await tabTempus.click(`button:enabled >> text="${lang.manage}" >> nth=0`);
    return tabTempus;
}

export async function tempusTextHeaders(browser: BrowserContext, walletConnected: boolean = false, langCode: string = 'en'):
    Promise<void> {
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    const lang: Language = await tempusSwitchLanguage(tabTempus, langCode);

    await tabTempus.waitForTimeout(LOAD_LONG_TIMEOUT);

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
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    const lang: Language = await tempusSwitchLanguage(tabTempus, langCode);
    await tabTempus.click(`svg:has-text("${asset}")`);
    const SELECTOR_MANAGE_BUTTON: string = `button >> text="${lang.manage}" >> nth=0`;

    await expect(tabTempus.locator(SELECTOR_MANAGE_BUTTON)).toBeDefined();
    await tabTempus.close();
}

export async function tempusNewRow(browser: BrowserContext, asset: string = 'USDC') {
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);

    const SELECTOR_ROWS: string = '.MuiTableRow-root';

    const oldRowCount: number = await tabTempus.locator(SELECTOR_ROWS).count();
    await tabTempus.click(`.MuiTableCell-root >> svg:has-text("${asset}")`);

    await expect(tabTempus.locator(SELECTOR_ROWS)).not.toHaveCount(oldRowCount);
    await tabTempus.close();
}

export async function tempusFiatCryptoButton(browser: BrowserContext, langCode: string = 'en') {
    await tempusNetworkChange(browser, 'Ethereum'); // works only on ETH atm, hardcoded ContainText
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    const lang: Language = await tempusSwitchLanguage(tabTempus, langCode);
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
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    const lang: Language = await tempusSwitchLanguage(tabTempus, langCode);

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

export async function tempusSwitchLanguage(tabTempus: Page, toLangCode: string = 'en',
    fromLangCode: string = 'en', empty_x: number = 300, empty_y: number = 300): Promise<Language> {
    if (toLangCode == fromLangCode) {
        return languageGenerator(toLangCode);
    }
    const fromLang: Language = languageGenerator(fromLangCode);
    const toLangName: string = getLangName(toLangCode);
    const fromLangName: string = getLangName(fromLangCode);
    await tabTempus.click(`text="${fromLang.settings}"`);
    await tabTempus.click(`text="${fromLangName}"`);
    await tabTempus.click(`text="${toLangName}"`);
    await tabTempus.mouse.click(empty_x, empty_y);

    return languageGenerator(toLangCode);
}
