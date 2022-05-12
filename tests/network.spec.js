'use strict'

const ROOT_PATH = '../'
const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright')
const {METAMASK_ID, TEMPUS_URL,
    LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT } = require(`${ROOT_PATH}utility/config.json`)
const {metamaskLogin} = require(`${ROOT_PATH}modules/metamask.js`)
const {tempusNetworkChange, tempusMetamaskConnect} = require(`${ROOT_PATH}modules/tempushome.js`)
const {chromiumPersistant} = require(`${ROOT_PATH}modules/browser.js`)


test.describe("POC tests", ()=>{
    let browser;
    test.beforeAll(async ()=>{
        browser = await chromiumPersistant()
        await metamaskLogin(browser)
        await tempusMetamaskConnect(browser)
    })

    test('Logged into metamask', async ()=>{
        const tabMetamask = await browser.newPage()
        await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#`)

        await expect(tabMetamask.locator('button:has-text("Buy")')).toBeDefined()
        await tabMetamask.close()
    })

    test('Change to Fantom network', async()=>{ 
        await tempusNetworkChange(browser, "Fantom")
    })

    test('Change to ETH network', async()=>{
        await tempusNetworkChange(browser, "Ethereum")
    })

    test.afterAll(async ()=>{
        await browser.close()
    })
})
