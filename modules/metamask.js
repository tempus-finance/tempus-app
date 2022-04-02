'use strict'

module.exports = {
    metamaskLogin, metamaskLogoff, metamaskAddETHfork, metamaskDownload,
    metamaskAccountAdd, metamaskAccountSwitch, metamaskAccountsAddAll
}
const ROOT_PATH = '../'
const { METAMASK_ID, METAMASK_PATH,
    LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT } = require(`${ROOT_PATH}utility/config.json`)

require('dotenv').config()

async function metamaskLogin(browser) {
    const tabMetamask = await browser.newPage()
    await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#unlock`)
    await tabMetamask.waitForTimeout(LOAD_LONG_TIMEOUT)
    await tabMetamask.bringToFront()

    //console.log(1)

    if (await tabMetamask.locator('text=Buy').count()) {
        //console.log(2)
        // pass
    }
    else if (await tabMetamask.locator('text="Unlock"').count()) {
        //console.log(3)
        await tabMetamask.fill('input[id="password"] >> nth=0', process.env.METAMASK_PASSWORD)
        await tabMetamask.click('text="Unlock" >> nth=0')
    }
    else if (await tabMetamask.locator('text=Get Started').count()) {
        //console.log(4)
        await tabMetamask.click('text=Get Started')
        await tabMetamask.click('text=Import wallet')
        await tabMetamask.click('text=I Agree')

        const words = process.env.METAMASK_RECOVERY_PHRASE.split(' ')
        for (var i = 0; i < 12; ++i) { // 12 word recovery phrase
            const SELECTOR_ITH_INPUT = `input[type="password"] >> nth=${i}`
            await tabMetamask.fill(SELECTOR_ITH_INPUT, words[i])
        }

        await tabMetamask.fill('input[type="password"] >> nth=12', process.env.METAMASK_PASSWORD)
        await tabMetamask.fill('input[type="password"] >> nth=13', process.env.METAMASK_PASSWORD)


        await tabMetamask.click('input[id="create-new-vault__terms-checkbox"]')
        await tabMetamask.click('text="Import"')
    }
    else {
        //console.log(5)
        throw 'Problem in metamaskLogin'
    }

    //await tabMetamask.pause()
    await tabMetamask.close()
}

async function metamaskLogoff(browser) {
    const tabMetamask = await browser.newPage()
    await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#`)
    await tabMetamask.waitForTimeout(LOAD_TIMEOUT)

    if (!(await tabMetamask.locator('text="Unlock"').count()) && !(await tabMetamask.locator('text="Get Started"').count())) {
        await tabMetamask.click('svg >> nth=0')
        await tabMetamask.click('text="Lock"')
    }

    await tabMetamask.close()
}

async function metamaskAddETHfork(browser) {
    const eth_fork = {
        Name: 'Tempus Ethereum Fork',
        RPC: 'https://network.tempus.finance',
        Chain: '31337',
        CurrencySymbol: 'ETH'
    }

    await metamaskLogin(browser)
    const tabMetamask = await browser.newPage()
    /*
    await tabMetamask.goto('chrome-extension://colclbomlgoedkilgbjjnddgkhokhbbc/home.html#')
    await tabMetamask.click('svg > rect >> nth=0')
    await tabMetamask.click('text="Settings"')
    await tabMetamask.click('text="Networks"')
    await tabMetamask.click('text="Add a network"')
    */

    await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#settings/networks/add-network`)
    await tabMetamask.waitForTimeout(LOAD_SHORT_TIMEOUT)

    await tabMetamask.fill('input >> nth=0', eth_fork.Name)
    await tabMetamask.fill('input >> nth=1', eth_fork.RPC)
    await tabMetamask.fill('input >> nth=2', eth_fork.Chain)
    await tabMetamask.fill('input >> nth=3', eth_fork.CurrencySymbol)

    await tabMetamask.waitForTimeout(LOAD_SHORT_TIMEOUT)
    if (await tabMetamask.locator('.btn--rounded[disabled]:has-text("Save")').count() == 0) { // save button is disabled
        await tabMetamask.click('text="Save"')
    }
    else {
        console.log('Couldn\'t add ETH fork to metamask. Error or ETH fork is already added.')
    }
    await tabMetamask.close()
    // TODO check if it exists in the start of the function, throw exception from "save doesnt exist branch"
}

async function metamaskAccountAdd(browser, privateKey) {
    await metamaskLogin(browser)
    const tabMetamask = await browser.newPage()
    await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#new-account/import`)
    await tabMetamask.waitForTimeout(LOAD_TIMEOUT)

    const SELECTOR_PASSWORD_INPUT = 'input[type="password"]'
    await tabMetamask.fill(SELECTOR_PASSWORD_INPUT, privateKey)
    await tabMetamask.click('text="Import"')
    // TODO check if it was added before and at the end
}

async function metamaskAccountSwitch(browser, accountIndex) {
    await metamaskLogin(browser)
    const tabMetamask = await browser.newPage()
    await tabMetamask.goto(`chrome-extension://${METAMASK_ID}/home.html#`)
    await tabMetamask.waitForTimeout(LOAD_TIMEOUT)

    const SELECTOR_ACCOUNTS = '.account-menu__name'
    if (tabMetamask.locator(SELECTOR_ACCOUNTS).count() >= accountIndex) {
        throw `There is no account with an index of ${accountIndex}`
    }

    await tabMetamask.click(`.account-menu__name >> nth=${accountIndex}`)
}

async function metamaskAccountsAddAll(browser) {
    // adds all accounts currently used for testing in order
    metamaskAccountAdd(browser, process.env.METAMASK_ACCOUNT_ETH_FORK)
    metamaskAccountAdd(browser, process.env.METAMASK_ACCOUNT_FANTOM)
}


const { download: CRXdownload } = require('download-crx')
const p7z = require('node-7z')
const path = require('path')
const { mkdir } = require('commandir')
const rimraf = require('rimraf')
const MM_URL = 'https://chrome.google.com/webstore/detail/nkbihfbeogaeaoehlefnkodbefgpgknn'


async function metamaskDownload(location = path.join(__dirname, ROOT_PATH, METAMASK_PATH)) {
    const MM_CRX_PATH = path.join(location, 'mm.crx');

    const rmrf = (filePath) => {
        return new Promise((resolve, reject) => {
            rimraf(filePath, (err, data) => {
                if (err) reject(err)
                else resolve(data)
            })
        })
    }

    rmrf(location)
        .catch()
        .then(() => mkdir(location))
        .then(() => CRXdownload(MM_URL, location, METAMASK_PATH))
        .then(() => {
            console.log(`CRX is located in ${MM_CRX_PATH}.`);
            console.log(`Extracting ${MM_CRX_PATH}...`)
            p7z.extractFull(MM_CRX_PATH, location)
        })
        .catch(err => console.log('CRX download and extraction failed.\n', err))
}
