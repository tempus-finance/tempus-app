const { chromium } = require('playwright');
const { test, expect } = require('@playwright/test');
const { metamaskAddETHfork, metamaskLogoff } = require('../modules/metamask');
const ROOT_PATH = "../";
const {USER_DATA_DIR, recoveryPhrase,  METAMASK_ID, METAMASK_PASSWORD, METAMASK_PATH, TEMPUS_URL } = require(`${ROOT_PATH}utility/config.json`);
const pathToExtension = require('path').join(__dirname, ROOT_PATH+METAMASK_PATH);
const {metamaskLogin} = require(`${ROOT_PATH}modules/metamask.js`);
const {chromiumPersistant} = require(`${ROOT_PATH}modules/browser.js`)

;(async()=>{
    const browser = await chromiumPersistant()
    await metamaskLogin(browser)
    await metamaskLogoff(browser)
    //await metamaskAddETHfork(browser)
})()

// th :text-is('Asset')
// th :text-is('Source')
// th :text-is('Maturity')
// th :text-is('Fixed APR')
// th :text-is('TVL')
// th :text-is('Balance')
// th :text-is('Available to Deposit')
