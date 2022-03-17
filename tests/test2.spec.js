const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright')
const { userDataDir, recoveryPhrase, metamaskId, metamaskPassword, metamaskPath, tempusUrl } = require("./config.json")
const pathToExtension = require('path').join(__dirname, "../", metamaskPath)
const fs = require('fs');


test.describe("POC tests", () => {
    var browser;
    test.beforeAll(async () => {
        test.setTimeout(90000);
        browser = await chromium.launchPersistentContext(userDataDir, {
            slowMo: 1500,
            headless: false,
            viewport: {
                width: 1500,
                height: 1000
            },
            args: [
                `--disable-extensions-except=${pathToExtension}`,
                `--load-extension=${pathToExtension}`,
                '--disable-dev-shm-usage',
                '--ipc=host'
            ]
        })
        fs.rmSync('user-data', { recursive: true, force: true });
        await loginToMetamask(browser)
    })

    test('Logged into metamask', async () => {
        const metamaskTab = await browser.newPage()
        await metamaskTab.goto(`chrome-extension://${metamaskId}/home.html#`)
        await expect(metamaskTab.locator('button:has-text("Buy")')).toBeDefined()
        await metamaskTab.close()
    })

    test('Connect Tempus to Metamask', async () => {
        const tempusTab = await browser.newPage()
        await tempusTab.goto(tempusUrl)
        await tempusTab.click('button:has-text("Connect Wallet")')
        var tabCount = browser.pages().length
        await tempusTab.click('span:has-text("MetaMask")')
        if (await browser.pages().length > tabCount) {
            const mm = await browser.pages().slice(-1)[0]
            await mm.locator('button:has-text("Next")').click()
            await mm.locator('button:has-text("Connect")').click()
        }
        //await metamaskId.goto('chrome-extension://oppgjjjdgfdgakaoegnmaeiohfmkppmi/home.html#connect/57Gu257Z4Rw5zmhoI2u2R')
    })

    test('Change to Fantom network', async () => {
        await changeNetwork("Fantom")
    })

    test.skip('Change to ETH network', async () => {
        await changeNetwork("Ethereum")
    })

    test.afterAll(async () => {
        await browser.close()
    })

    async function loginToMetamask(browser) {
        const metamaskTab = await browser.newPage()
        var fullVersion = '' + parseFloat(navigator.appVersion);
        var verOffset
        if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
            browserName = "Chrome";
            fullVersion = nAgt.substring(verOffset + 7);
        }
        await metamaskTab.goto('chrome://extensions')
        await metamaskTab.fill('input[id="searchInput"]', 'MetaMask')
        await metamaskTab.click('text=Details')
        const extensionUrl = await metamaskTab.url()
        console.error('irinel ', fullVersion)
        console.log('irinel ', fullVersion)
        const pattern = /(?<==).*/
        const nMetamaskId = extensionUrl.match(pattern)[0]
        await metamaskTab.waitForTimeout(10000)
        await metamaskTab.goto(`chrome-extension://${nMetamaskId}/home.html#unlock`)
        await metamaskTab.locator('text=Get Started').click();
        await metamaskTab.bringToFront()
        await metamaskTab.locator('text=Import wallet').click();
        await metamaskTab.locator('text=I Agree').click();
        await metamaskTab.fill('id=password', metamaskPassword)
        await metamaskTab.fill('id=confirm-password', metamaskPassword)
        await metamaskTab.fill('[placeholder="Enter your Secret Recovery Phrase"]', process.env.WALLET_RECOVERY_PHRASE)
        await metamaskTab.locator('[class*="first-time-flow__terms"]').check()
        await metamaskTab.locator('button:has-text("Import")').click();
        await metamaskTab.locator('button:has-text("All Done")').click();
        await metamaskTab.close()
    }

    async function changeNetwork(network) {
        const tempusTab = await browser.newPage()
        await tempusTab.goto(tempusUrl)

        await tempusTab.waitForTimeout(1000)

        await tempusTab.click('[class="tc__btn tc__connect-wallet-network-picker"]')
        await tempusTab.waitForTimeout(100)
        var tabCount = browser.pages().length
        await tempusTab.click(`button:has-text("${network}")`)

        await tempusTab.waitForTimeout(1000);

        if (await browser.pages().length > tabCount) {
            const mm = await browser.pages().slice(-1)[0]
            await mm.locator('button:has-text("Approve")').click()
            await mm.locator('button:has-text("Switch network")').click()
        }

        //TODO check if switched
        await tempusTab.waitForTimeout(1000)
        await tempusTab.close()
    }

})

/*
async function connectMetamaskToTempus(tab){
        var button;
        try{
            button = await tab.evaluate(() => document.querySelector('.tc__connect-wallet-button > div').innerHTML)
        }
        catch{
            button = null
        }
        console.log(button)

        if(button!=null && button.innerHTML=="Connect Wallet"){
            console.log(1)
            await tab.click('button:has-text("Connect Wallet")')
            await tab.click('span:has-text("MetaMask")')
        }
    }
*/
