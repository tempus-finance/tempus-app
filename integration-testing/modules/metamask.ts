import { readFile, writeFile } from 'fs/promises';
import { exit } from 'process';
import { BrowserContext, Page } from 'playwright';
import config from '../utility/config';
import {
    METAMASK_ID_PATH, LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT
} from "../utility/constants";
import { readFileSync } from 'fs';
import { join as pathjoin } from 'path';


const ROOT_PATH: string = '../../';
export const METAMASK_ID: string = readFileSync(pathjoin(__dirname, ROOT_PATH, METAMASK_ID_PATH), { encoding: 'utf-8', flag: 'r' });
export const METAMASK_CHROME_URL = `chrome-extension://${METAMASK_ID}/home.html#`;

export async function metamaskGetId(src: string = METAMASK_ID_PATH):
    Promise<string> {
    return (await readFile(src)
        .catch(() => {
            console.log(`Failed to read ${pathjoin(__dirname, ROOT_PATH, src)}`);
            exit(1);
        }))
        .toString();
}

export async function metamaskRetrieveId(browser: BrowserContext):
    Promise<string> {
    const extensionTab: Page = await browser.newPage();
    await extensionTab.goto('chrome://extensions');
    await extensionTab.click('cr-icon-button[iron-icon="cr:search"]');
    await extensionTab.fill('input[id="searchInput"]', 'MetaMask');
    await extensionTab.click('text=Details >> nth=0');
    const extensionUrl = await extensionTab.url();
    await extensionTab.close();
    const pattern = /(?<==).*/;
    const arr: RegExpMatchArray | null = extensionUrl.match(pattern);
    const id: string = arr == null ? 'FAILEDTOGETURL' : arr[0];
    console.log(`Metamask ID: ${id}`);
    return id;
}

export async function metamaskUpdateId(browser: BrowserContext,
    src: string = METAMASK_ID_PATH): Promise<void> {
    const mmId = await metamaskRetrieveId(browser);
    const path: string = pathjoin(__dirname, ROOT_PATH, src);
    await writeFile(path, mmId)
        .then(() => {
            console.log(`Succesfully wrote metamask id into ${path}`);
        })
        .catch(() => {
            console.log(`Failed to write to ${path}`);
        });
}

export async function metamaskRegister(browser: BrowserContext): Promise<void> {
    const tabMetamask: Page = await browser.newPage();
    await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#unlock`);
    await tabMetamask.waitForTimeout(LOAD_LONG_TIMEOUT);
    await tabMetamask.bringToFront();

    if (!await tabMetamask.locator('text=Get Started').count()) {
        return await tabMetamask.close();
    }
    await tabMetamask.click('text=Get Started');
    await tabMetamask.click('text=Import wallet');
    await tabMetamask.click('text=I Agree');

    const words: string[] = config.METAMASK_RECOVERY_PHRASE.split(' ');
    for (var i = 0; i < 12; ++i) {
        const SELECTOR_ITH_INPUT: string = `input[type="password"] >> nth=${i}`;
        await tabMetamask.fill(SELECTOR_ITH_INPUT, words[i]);
    }

    await tabMetamask.fill('input[type="password"] >> nth=12', config.METAMASK_PASSWORD);
    await tabMetamask.fill('input[type="password"] >> nth=13', config.METAMASK_PASSWORD);

    await tabMetamask.click('input[id="create-new-vault__terms-checkbox"]');
    await tabMetamask.click('text="Import"');

    await tabMetamask.waitForTimeout(LOAD_LONG_TIMEOUT);
    const SELECTOR_NEXT: string = 'text="Next"';
    if (await tabMetamask.locator(SELECTOR_NEXT).count()) {
        await tabMetamask.click(SELECTOR_NEXT);
    }

    const SELECTOR_RML: string = 'text="Remind me later"'
    if (await tabMetamask.locator(SELECTOR_RML).count()) {
        await tabMetamask.click(SELECTOR_RML);
    }

    const SELECTOR_ALLDONE: string = 'text="All Done"'
    if (await tabMetamask.locator(SELECTOR_ALLDONE).count()) {
        await tabMetamask.click(SELECTOR_ALLDONE);
    }

    console.log('Metamask account registered');
    await tabMetamask.close();
}


export async function metamaskLogin(browser: BrowserContext): Promise<void> {
    const tabMetamask: Page = await browser.newPage();
    await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#unlock`);
    await tabMetamask.waitForTimeout(LOAD_LONG_TIMEOUT);
    await tabMetamask.bringToFront();

    if (await tabMetamask.locator('text=Buy').count()) {
        return await tabMetamask.close();
    }
    else if (await tabMetamask.locator('text=Get Started').count()) {
        await metamaskRegister(browser);
        await metamaskLogin(browser);
    }
    else if (await tabMetamask.locator('text="Unlock"').count()) {
        await tabMetamask.fill('input[id="password"] >> nth=0', config.METAMASK_PASSWORD);
        await tabMetamask.click('text="Unlock" >> nth=0');
    }

    await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#initialize/seed-phrase-intro`);
    await tabMetamask.waitForTimeout(LOAD_LONG_TIMEOUT);
    const SELECTOR_NEXT: string = 'text="Next"';
    const SELECTOR_RML: string = 'text="Remind me later"';
    if (await tabMetamask.locator(SELECTOR_NEXT).count()) {
        await tabMetamask.click(SELECTOR_NEXT);
        await tabMetamask.click(SELECTOR_RML);
    }
    await tabMetamask.close();
}

export async function metamaskLogoff(browser: BrowserContext): Promise<void> {
    const tabMetamask: Page = await browser.newPage();
    await tabMetamask.goto(`${METAMASK_CHROME_URL}new-account/import`);
    await tabMetamask.waitForTimeout(LOAD_TIMEOUT);
    if (!(await tabMetamask.locator('text="Unlock"').count()) && !(await tabMetamask.locator('text="Get Started"').count())) {
        await tabMetamask.waitForTimeout(LOAD_TIMEOUT);
        await tabMetamask.click('.account-menu__icon'); // .identicon >> nth=0
        await tabMetamask.click('text="Lock"');
    }
    await tabMetamask.close()
}

export async function metamaskAddETHfork(browser: BrowserContext): Promise<void> {
    const eth_fork = {
        Name: 'Tempus Ethereum Fork',
        RPC: 'https://network.tempus.finance',
        Chain: '31337',
        CurrencySymbol: 'ETH'
    };

    //await metamaskLogin(browser);
    const tabMetamask: Page = await browser.newPage()
    await tabMetamask.goto(`${METAMASK_CHROME_URL}#settings/networks/add-network`);
    await tabMetamask.waitForTimeout(LOAD_SHORT_TIMEOUT);
    await tabMetamask.fill('input >> nth=1', eth_fork.Name);
    await tabMetamask.fill('input >> nth=2', eth_fork.RPC);
    await tabMetamask.fill('input >> nth=3', eth_fork.Chain);
    await tabMetamask.fill('input >> nth=4', eth_fork.CurrencySymbol);


    await tabMetamask.waitForTimeout(LOAD_SHORT_TIMEOUT);
    if (await tabMetamask.locator('.btn--rounded[disabled]:has-text("Save")').count() == 0) {
        await tabMetamask.click('text="Save"');
        console.log('ETH fork successfully added to Metamask');
    }
    else {
        console.log('Couldn\'t add ETH fork to metamask. Error or ETH fork is already added.');
    }
    await tabMetamask.close();
}

export async function metamaskAccountAdd(browser: BrowserContext, privateKey: string):
    Promise<void> {
    await metamaskLogin(browser);
    const tabMetamask: Page = await browser.newPage();
    await tabMetamask.goto(`${METAMASK_CHROME_URL}new-account/import`);
    await tabMetamask.waitForTimeout(LOAD_TIMEOUT);

    const SELECTOR_PASSWORD_INPUT: string = 'input[type="password"]';
    await tabMetamask.fill(SELECTOR_PASSWORD_INPUT, privateKey);
    await tabMetamask.click('text="Import"');
}

export async function metamaskAccountsAddAll(browser: BrowserContext): Promise<void> {
    await metamaskAccountAdd(browser, config.METAMASK_ACCOUNT_ETH_FORK);
    console.log('Added ETH fork account');
    await metamaskAccountAdd(browser, config.METAMASK_ACCOUNT_FANTOM);
    console.log('Added FTM account');
}

const accountIndexs: Map<string, number> = new Map<string, number>([
    ['Default', 0],
    ['ETH fork', 1],
    ['FTM', 2],
]);

export function getAccountIndex(name: string): number {
    const val: number | undefined = accountIndexs.get(name);
    if (val == undefined) {
        throw new Error(`Failed to find account named ${name}`);
    }
    return val;
}

export async function metamaskAccountSwitch(browser: BrowserContext, accountIndex: number):
    Promise<void> {
    //await metamaskLogin(browser);
    const tabMetamask: Page = await browser.newPage();
    await tabMetamask.goto(`${METAMASK_CHROME_URL}new-account/import`);
    await tabMetamask.click('.account-menu__icon');

    const SELECTOR_ACCOUNTS: string = '.account-menu__name';
    /*if (await tabMetamask.locator(SELECTOR_ACCOUNTS).count() >= accountIndex) {
        throw `There is no account with an index of ${accountIndex}`;
    }*/

    await tabMetamask.click(`${SELECTOR_ACCOUNTS} >> nth=${accountIndex}`);

    const SELECTOR_CONNECT: string = 'text=Connect';
    if (await tabMetamask.locator(SELECTOR_CONNECT).count()) {
        await tabMetamask.click(SELECTOR_CONNECT);
    }
}

export async function metamaskConfirmConnection(browser: BrowserContext) {
    const mm: Page = await browser.pages().slice(-1)[0];
    await mm.waitForTimeout(LOAD_LONG_TIMEOUT * 2);
    await mm.click('text="Next"');
    await mm.click('text="Connect"');
    mm.close();
}