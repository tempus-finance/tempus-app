const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright')
const ROOT_PATH = '../'
const {USER_DATA_DIR, RECOVERY_PHRASE, METAMASK_ID, METAMASK_PASSWORD, METAMASK_PATH, TEMPUS_URL, LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT } = require(`${ROOT_PATH}utility/config.json`)
const EXTENSION_PATH = require('path').join(__dirname, ROOT_PATH+METAMASK_PATH)
const {metamaskLogin} = require(`${ROOT_PATH}modules/metamask.js`)
const {tempusManageCurrency, tempusMetamaskConnect} = require(`${ROOT_PATH}modules/tempushome.js`)


test.describe('Open Manage tabs', ()=>{ 
    var browser;
    test.beforeAll(async ()=>{
        browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
            slowMo: LOAD_TIMEOUT,
            headless: false,
            args: [
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`
            ]
        })
        await metamaskLogin(browser)
        await tempusMetamaskConnect(browser)
    })

    test('Logged into metamask', async ()=>{
        const tabMetamask = await browser.newPage()
        await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#`)

        await expect(tabMetamask.locator('button:has-text("Buy")')).toBeDefined()
        await tabMetamask.close()
    })

    test("Manage USDC", async()=>{
        const tabManage = await tempusManageCurrency(browser, 'USDC')
        await expect(tabManage.locator('text=Total Value Locked')).toBeDefined()
        tabManage.close()
    })

    test("Manage DAI", async()=>{
        const tabManage = await tempusManageCurrency(browser, 'DAI')
        await expect(tabManage.locator('text=Total Value Locked')).toBeDefined()
        tabManage.close()
    })
    test.afterAll(async ()=>{
        await browser.close();
    })
})