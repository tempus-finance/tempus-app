'use strict'

module.exports = {manageDeposit}
const ROOT_PATH = '../'
const {USER_DATA_DIR, RECOVERY_PHRASE, METAMASK_ID, METAMASK_PASSWORD, METAMASK_PATH, TEMPUS_URL, LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT } = require(`${ROOT_PATH}utility/config.json`)
const {tempusManageCurrency} = require(`${ROOT_PATH}utility/tempushome.js`);

async function manageDeposit(browser, amount='0.1', pool='USDC', token='USDC', fixedYield=true){
    const tabManage = tempusManageCurrency(browser, pool)
    await tabManage.click('text="Deposit"')
    await tabManage.click('.MuiSelect-root') //await tabManage.click('text=Please select')
    await tabManage.click(`.MuiButtonBase-root :text("${token}") >> nth=0`)
    await tabManage.waitForTimeout(LOAD_SHORT_TIMEOUT)
    await tabManage.fill('input[type="text"]', amount)

    if(fixedYield){
        await tabManage.click('text="Fixed Yield"')
    }
    else{
        await tabManage.click('text="Variable Yield"')
    }

    const tabCount = browser.pages().length
    await tabManage.click('text="Approve"')
    await tabManage.waitForTimeout(LOAD_TIMEOUT)

    if(await browser.pages().length > tabCount ){
        // approve or reject in metamask
        const mm = await browser.pages().slice(-1)[0]
        if(await mm.locator('text="Approve"').count()){
            await mm.click('text="Approve"')
        }
        else{
            await mm.click('text="Reject"')
        }

        await mm.waitForTimeout(LOAD_TIMEOUT)
        await mm.click('button:has-text("Switch network")')
    }

    await tabManage.close()
}