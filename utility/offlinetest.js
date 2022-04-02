const { chromium } = require('playwright');
const { test, expect } = require('@playwright/test');
const { metamaskAddETHfork } = require('../modules/metamask');
const ROOT_PATH = "../";
const {USER_DATA_DIR, recoveryPhrase,  METAMASK_ID, METAMASK_PASSWORD, METAMASK_PATH, TEMPUS_URL } = require(`${ROOT_PATH}utility/config.json`);
const pathToExtension = require('path').join(__dirname, ROOT_PATH+METAMASK_PATH);
const {metamaskLogin} = require(`${ROOT_PATH}modules/metamask.js`);


async function emptyBrowser(){
    const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: false,
        slowMo: 350,
        args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`
        ]
    })

    const page = await browser.newPage()
    //await f(browser)
    await page.pause()
}


/*
const {download: CRXdownload} = require('download-crx')
const p7z = require('node-7z')
const path = require('path')
const MM_PATH = path.join(__dirname, 'mm2/mm2.crx')


CRXdownload(`https://chrome.google.com/webstore/detail/nkbihfbeogaeaoehlefnkodbefgpgknn`, path.join(__dirname, 'mm2'), 'mm2')
.then(filePath => {
    console.log(`crx is located in ${filePath}`);
    console.log(`7z ${filePath}`)
    p7z.extractFull(filePath, path.join(__dirname, 'mm2'))
})
.catch(err=>{
    console.log('CRX download and extraction failed\n', err)
})
*/

const {metamaskDownload} = require(`${ROOT_PATH}/modules/metamask.js`);
metamaskDownload()
