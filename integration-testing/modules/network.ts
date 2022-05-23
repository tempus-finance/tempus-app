import { BrowserContext, Page } from "playwright";
import { LOAD_SHORT_TIMEOUT, LOAD_TIMEOUT, TEMPUS_URL } from "../utility/constants";
import { Language, languageGenerator } from "./language";

class Network {
    symbol: string;
    name: string;
    assets: string[];
    constructor(_symbol: string, _name: string, _assets: string[]) {
        this.symbol = _symbol;
        this.name = _name;
        this.assets = _assets;
    }
}

export const ETH_ASSETS: string[] = ['ETH', 'USDC', 'DAI'];
export const FTM_ASSETS: string[] = ['USDC', 'DAI', 'USDT', 'WETH', 'YFI'];

export const ETH_NETWORK: Network = new Network('ETH', 'Ethereum', ETH_ASSETS);
export const TEMPUS_ETH_NETWORK: Network = new Network('ETH', 'Tempus Ethereum Fork', ETH_ASSETS);
export const FTM_NETWORK: Network = new Network('FTM', 'Fantom', FTM_ASSETS);
export const NETWORKS: Network[] = [ETH_NETWORK, TEMPUS_ETH_NETWORK, FTM_NETWORK];

export async function tempusNetworkChange(browser: BrowserContext, networkName: string, langCode: string = 'en'):
    Promise<void> {
    const lang: Language = languageGenerator(langCode);
    const tabTempus: Page = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);

    await tabTempus.waitForTimeout(LOAD_TIMEOUT);
    await tabTempus.click('.tc__connect-wallet-network-picker');

    await tabTempus.waitForTimeout(LOAD_SHORT_TIMEOUT);
    const tabCount: number = browser.pages().length;
    await tabTempus.click(`button:has-text("${networkName}")`);

    await tabTempus.waitForTimeout(LOAD_TIMEOUT);

    if (await browser.pages().length > tabCount) {
        const mm = await browser.pages().slice(-1)[0];
        await mm.bringToFront();
        await mm.waitForTimeout(LOAD_TIMEOUT);
        if (await mm.locator(`text="${lang.approve}"`).count()) {
            await mm.click(`text="${lang.approve}"`);
            await mm.waitForTimeout(LOAD_TIMEOUT);
        }
        await mm.click(`button:has-text("${lang.switchNetwork}")`);
    }

    await tabTempus.waitForTimeout(LOAD_TIMEOUT);
    await tabTempus.close();
}