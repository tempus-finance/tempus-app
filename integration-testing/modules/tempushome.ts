import { BrowserContext, expect, Page } from '@playwright/test';
import { TEMPUS_URL, LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT }
    from "../utility/constants";

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

        // untested block
        await mm.bringToFront();
        await mm.waitForTimeout(LOAD_LONG_TIMEOUT);
        const SELECTOR_NEXT = 'text="Next"';
        await mm.click(SELECTOR_NEXT);

        await mm.click('text="Connect"');
        // mm autocloses after click
    }
    await tabTempus.close();
}

export async function tempusNetworkChange(browser: BrowserContext, network: string):
    Promise<void> {
    const tabTempus: Page = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);

    await tabTempus.waitForTimeout(LOAD_TIMEOUT);
    await tabTempus.click('.tc__connect-wallet-network-picker');

    // Choose metamask here
    await tabTempus.waitForTimeout(100);
    const tabCount: number = browser.pages().length;
    await tabTempus.click(`button:has-text("${network}")`);

    await tabTempus.waitForTimeout(LOAD_TIMEOUT);

    if (await browser.pages().length > tabCount) {
        const mm = await browser.pages().slice(-1)[0];
        await mm.bringToFront();
        await mm.waitForTimeout(LOAD_TIMEOUT);
        if (await mm.locator('text=Approve').count()) {
            //await mm.locator('button:has-text("Approve")').click()
            await mm.click('text=Approve');
            await mm.waitForTimeout(LOAD_TIMEOUT);
        }
        await mm.click('button:has-text("Switch network")');
    }

    // Approve, Switch network
    //TODO check if switched
    await tabTempus.waitForTimeout(LOAD_TIMEOUT);
    await tabTempus.close();
}

export async function tempusManageCurrency(browser: BrowserContext, asset: string = 'USDC'):
    Promise<Page> {
    // returns manage tab
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    await tabTempus.click(`svg:has-text("${asset}")`);
    await tabTempus.click('text=Manage >> nth=0');
    return tabTempus;
}

export async function tempusTextHeaders(browser: BrowserContext, walletConnected: boolean = false):
    Promise<void> {
    const tabTempus = await browser.newPage();
    await tabTempus.goto(TEMPUS_URL);
    await tabTempus.waitForTimeout(LOAD_LONG_TIMEOUT);

    await expect(tabTempus.locator('th >> nth=0')).toHaveText('Asset');
    await expect(tabTempus.locator('th >> nth=1')).toHaveText('Source');
    await expect(tabTempus.locator('th >> nth=2')).toHaveText('Maturity');
    await expect(tabTempus.locator('th >> nth=3')).toHaveText('Fixed APR');
    await expect(tabTempus.locator('th >> nth=4')).toHaveText('TVL');
    if (walletConnected) {
        await expect(tabTempus.locator('th >> nth=5')).toHaveText('Balance');
        await expect(tabTempus.locator('th >> nth=6')).toHaveText('Available to Deposit');
    }
    await tabTempus.close();
}
