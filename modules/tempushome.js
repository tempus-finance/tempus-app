'use strict'

const { expect } = require("@playwright/test")

module.exports = {
    tempusManageCurrency, tempusMetamaskConnect, tempusNetworkChange,
    tempusTextHeaders
}
const ROOT_PATH = '../'
const { TEMPUS_URL, LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT } = require(`${ROOT_PATH}utility/config.json`)

async function tempusMetamaskConnect(browser) {
    const tabTempus = await browser.newPage()
    await tabTempus.goto(TEMPUS_URL)
    await tabTempus.waitForTimeout(LOAD_TIMEOUT)
    if (await tabTempus.locator('text=Connect Wallet').count() == 0) {
        await tabTempus.close()
        return null
    }

    const tabCountBefore = await browser.pages().length
    await tabTempus.click('text=Connect Wallet')
    await tabTempus.click('text=MetaMask')
    await tabTempus.waitForTimeout(LOAD_LONG_TIMEOUT)
    const tabCountAfter = await browser.pages().length

    if (tabCountAfter > tabCountBefore) {
        const mm = await browser.pages().slice(-1)[0]

        // untested block, need to restart
        await mm.bringToFront()
        await mm.waitForTimeout(LOAD_LONG_TIMEOUT)
        const SELECTOR_NEXT = 'text="Next"'
        await mm.click(SELECTOR_NEXT)

        await mm.click('text="Connect"')
        // mm autocloses
    }
    await tabTempus.close()
}

async function tempusNetworkChange(browser, network) {
    const tabTempus = await browser.newPage()
    await tabTempus.goto(TEMPUS_URL)

    await tabTempus.waitForTimeout(LOAD_TIMEOUT)

    await tabTempus.click('.tc__connect-wallet-network-picker')

    // Choose metamask here
    await tabTempus.waitForTimeout(100)
    const tabCount = browser.pages().length
    await tabTempus.click(`button:has-text("${network}")`)

    await tabTempus.waitForTimeout(LOAD_TIMEOUT);

    if (await browser.pages().length > tabCount) {
        const mm = await browser.pages().slice(-1)[0]
        await mm.bringToFront()
        await mm.waitForTimeout(LOAD_TIMEOUT)
        if (await mm.locator('text=Approve').count()) {
            //await mm.locator('button:has-text("Approve")').click()
            await mm.click('text=Approve')
            await mm.waitForTimeout(LOAD_TIMEOUT)
        }
        await mm.click('button:has-text("Switch network")')
    }

    // Approve, Switch network
    //TODO check if switched
    await tabTempus.waitForTimeout(LOAD_TIMEOUT)
    await tabTempus.close()
}

async function tempusManageCurrency(browser, asset = 'USDC') {
    // returns manage tab
    const tabTempus = await browser.newPage()
    await tabTempus.goto(TEMPUS_URL)
    await tabTempus.click(`svg:has-text("${asset}")`)
    await tabTempus.click('text=Manage >> nth=0')
    return tabTempus
}

// th :text-is('Asset')
// th :text-is('Source')
// th :text-is('Maturity')
// th :text-is('Fixed APR')
// th :text-is('TVL')
// th :text-is('Balance')
// th :text-is('Available to Deposit')

async function tempusTextHeaders(browser, walletConnected = false) {
    const tabTempus = await browser.newPage()
    await tabTempus.goto(TEMPUS_URL)
    await tabTempus.waitForTimeout(LOAD_LONG_TIMEOUT);

    await expect(tabTempus.locator('th >> nth=0')).toHaveText('Asset')
    await expect(tabTempus.locator('th >> nth=1')).toHaveText('Source')
    await expect(tabTempus.locator('th >> nth=2')).toHaveText('Maturity')
    await expect(tabTempus.locator('th >> nth=3')).toHaveText('Fixed APR')
    await expect(tabTempus.locator('th >> nth=4')).toHaveText('TVL')
    if (walletConnected) {
        await expect(tabTempus.locator('th >> nth=5')).toHaveText('Balance')
        await expect(tabTempus.locator('th >> nth=6')).toHaveText('Available to Deposit')
    }
    await tabTempus.close()
}
