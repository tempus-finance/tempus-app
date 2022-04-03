'use strict'

const ROOT_PATH = '../'
const { test, expect } = require('@playwright/test');
const { METAMASK_ID, TEMPUS_URL,
    LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT } = require(`${ROOT_PATH}utility/config.json`)
const { metamaskLogin, metamaskLogoff } = require(`${ROOT_PATH}modules/metamask.js`)
const { chromiumPersistant } = require(`${ROOT_PATH}modules/browser.js`)
const { tempusTextHeaders } = require(`${ROOT_PATH}modules/tempushome.js`)


test.describe('Homepage text matching', () => {
    let browser;
    test.beforeAll(async () => {
        browser = await chromiumPersistant()
        await metamaskLogin(browser)
    })

    test('Headers, wallet connected', async () => {
        await tempusTextHeaders(browser, true)
    })

    test.skip('Headers, wallet not connected', async () => {
        await metamaskLogoff(browser)
        await tempusTextHeaders(browser, false)
        //await metamaskLogin(browser) not needed if its the last test
    })
    test.afterAll(async () => {
        await browser.close();
    })
})
