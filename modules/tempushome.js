'use strict'

module.exports = {tempusManageCurrency, tempusMetamaskConnect, tempusNetworkChange}
const ROOT_PATH = '../'
const {USER_DATA_DIR, RECOVERY_PHRASE, METAMASK_ID, METAMASK_PASSWORD, METAMASK_PATH, TEMPUS_URL, LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT } = require(`${ROOT_PATH}utility/config.json`)

async function tempusMetamaskConnect(browser){
    const tabTempus = await browser.newPage()
    await tabTempus.goto(TEMPUS_URL)
    await tabTempus.waitForTimeout(LOAD_TIMEOUT)
    if(await tabTempus.locator('text=Connect Wallet').count()==0){
        await tabTempus.close()
        return null
    }

    const tabCountBefore = await browser.pages().length
    await tabTempus.click('text=Connect Wallet')
    await tabTempus.click('text=MetaMask')
    await tabTempus.waitForTimeout(LOAD_TIMEOUT)
    const tabCountAfter = await browser.pages().length
    // click Next, 
    if(tabCountAfter > tabCountBefore){
        const mm = await browser.pages().slice(-1)[0]
        // TODO choose wallet
        await mm.click('text=Next')
        await mm.click('text=Connect')
        // mm autocloses
    }
    await tabTempus.close()
}

async function tempusNetworkChange(browser, network){
    const tabTempus = await browser.newPage()
    await tabTempus.goto(TEMPUS_URL)

    await tabTempus.waitForTimeout(LOAD_TIMEOUT)

    await tabTempus.click('.tc__connect-wallet-network-picker')

    // Choose metamask here
    await tabTempus.waitForTimeout(100)
    const tabCount = browser.pages().length
    await tabTempus.click(`button:has-text("${network}")`)

    await tabTempus.waitForTimeout(LOAD_TIMEOUT);

    if(await browser.pages().length > tabCount ){
        const mm = await browser.pages().slice(-1)[0]
        if(await mm.locator('text=Approve').count()){
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

async function tempusManageCurrency(browser, pool='USDC'){
    // returns manage tab
    const tabTempus = await browser.newPage()
    await tabTempus.goto(TEMPUS_URL)
    await tabTempus.click(`svg:has-text("${pool}")`)
    await tabTempus.click('text=Manage >> nth=0')
    return tabTempus 
}