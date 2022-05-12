'use strict'

const ROOT_PATH = '../'
const { test, expect } = require('@playwright/test');
const { METAMASK_ID, TEMPUS_URL,
    LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT } = require(`${ROOT_PATH}utility/config.json`)
const { metamaskRegister, metamaskLogin, metamaskLogoff } = require(`${ROOT_PATH}modules/metamask.js`)
const { chromiumPersistant } = require(`${ROOT_PATH}modules/browser.js`)
const { tempusMetamaskConnect } = require(`${ROOT_PATH}modules/tempushome.js`)


test.describe('Logins and connections', () => {
    let browser;
    test.beforeAll(async () => {
        browser = await chromiumPersistant()
    })

    test('Metamask register', async () => {
        await test.setTimeout(60 * 1000)
        await metamaskRegister(browser)
    })

    test('Metamask login', async () => {
        await metamaskLogin(browser)
    })

    test('First metamask - tempus connect', async () => {
        await tempusMetamaskConnect(browser)
    })

    test.afterAll(async () => {
        await browser.close()
    })
})
