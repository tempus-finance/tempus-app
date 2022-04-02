const CONFIG_NEW = {
    "USER_DATA_DIR": "utility/user_data",
    "RECOVERY_PHRASE": "poverty panel clip invite side foam theory among sign stick fiscal dad",
    "METAMASK_PASSWORD": "TempusPassword1",
    "METAMASK_PATH": "mm",
    "METAMASK_ID": "-",
    "TEMPUS_URL": "https://tempus-app-stage.web.app/",
    "LOAD_TIMEOUT": 600,
    "LOAD_SHORT_TIMEOUT": 200,
    "LOAD_LONG_TIMEOUT": 1800
}
const { chromium } = require('playwright');
const { test, expect } = require('@playwright/test');
const ROOT_PATH = './';
const USER_DATA_DIR = CONFIG_NEW.USER_DATA_DIR;
const METAMASK_PATH = CONFIG_NEW.METAMASK_PATH;
const LOAD_TIMEOUT = CONFIG_NEW.LOAD_TIMEOUT;
const EXTENSION_PATH = require('path').join(__dirname, ROOT_PATH + METAMASK_PATH);
const { exit } = require('process');
const fsPromises = require("fs/promises");

async function setupUtility(browser) {
    await fsPromises.access('utility')
        .then(() => console.log("utility/ already exists"))
        .catch(() => {
            fsPromises.mkdir('utility')
                .then(() => console.log('utility/ created successfully'))
                .catch(() => {
                    console.log('Failed to create utility')
                    exit(1)
                })
        })

    const extensionTab = await browser.newPage()
    await extensionTab.goto('chrome://extensions')
    await extensionTab.fill('input[id="searchInput"]', 'MetaMask')
    await extensionTab.click('text=Details >> nth=0')
    const extensionUrl = await extensionTab.url()
    await extensionTab.close()

    //console.log(extensionUrl)
    const pattern = /(?<==).*/
    const nMetamaskId = extensionUrl.match(pattern)[0]
    //console.log(nMetamaskId)
    CONFIG_NEW.METAMASK_ID = nMetamaskId

    await fsPromises.writeFile('utility/config.json', JSON.stringify(CONFIG_NEW))
        .then(() => console.log('utility/config.json successfully written'))
        .catch(() => {
            console.log('Failed to write utility/config.json. Exiting...')
            exit(1)
        })
}

const { metamaskLogin, metamaskDownload } = require(`${ROOT_PATH}modules/metamask.js`);
const { tempusMetamaskConnect } = require(`${ROOT_PATH}modules/tempushome.js`);
const { sleep } = require('sleepjs');

(async () => {
    await metamaskDownload()
    await sleep(5000)

    const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
        slowMo: LOAD_TIMEOUT,
        headless: false,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`
        ],
        viewport: {
            width: 1500,
            height: 1300
        },
    })
    await setupUtility(browser)
    await metamaskLogin(browser)
        .then(() => console.log('Logged into MetaMask'))
    //await browser.pages()[0].pause()
    await tempusMetamaskConnect(browser)
        .then(() => console.log('Connected to Tempus via Metamask'))
    //await browser.pages()[0].pause()
    await browser.close()
    exit(0)
})()

