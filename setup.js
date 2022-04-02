'use strict'

const ROOT_PATH = './';
const CONFIG_NEW = { 
    "USER_DATA_DIR" : "utility/user_data", 
    "METAMASK_PATH": "mm",
    "METAMASK_ID" : "-",
    "TEMPUS_URL": "https://tempus-app-stage.web.app/",
    "LOAD_TIMEOUT": 600,
    "LOAD_SHORT_TIMEOUT": 200,
    "LOAD_LONG_TIMEOUT": 1800,
    "BROWSER_WIDTH": 1200,
    "BROWSER_HEIGHT": 1000
}

const { chromium } = require('playwright');
const USER_DATA_DIR = CONFIG_NEW.USER_DATA_DIR;
const METAMASK_PATH = CONFIG_NEW.METAMASK_PATH;
const LOAD_TIMEOUT = CONFIG_NEW.LOAD_TIMEOUT;
const EXTENSION_PATH = require('path').join(__dirname, ROOT_PATH+METAMASK_PATH);
const { exit } = require('process');
const fsPromises = require("fs/promises");

async function setupUtility(browser){
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

    await fsPromises.writeFile('utility/config.json', JSON.stringify(CONFIG_NEW, null, 2))
    .then(()=> console.log('utility/config.json successfully written'))
    .catch(()=> {
        console.log('Failed to write utility/config.json. Exiting...')
        exit(1)
    })
}

//const {metamaskLogin, metamaskDownload} = require(`${ROOT_PATH}modules/metamask.js`);
//const {tempusMetamaskConnect} = require(`${ROOT_PATH}modules/tempushome.js`);

const {sleep} = require('sleepjs');
const {download: CRXdownload} = require('download-crx')
const p7z = require('node-7z')
const path = require('path')
const {mkdir} = require('commandir')
const rimraf = require('rimraf')
const MM_URL = 'https://chrome.google.com/webstore/detail/nkbihfbeogaeaoehlefnkodbefgpgknn'


async function metamaskDownload(location = path.join(__dirname, ROOT_PATH, CONFIG_NEW.METAMASK_PATH)){
    const MM_CRX_PATH = path.join(location, 'mm.crx');

    const rmrf = (filePath)=>{
        return new Promise((resolve, reject) => {
            rimraf(filePath, (err, data) => {
                if(err) reject(err)
                else resolve(data)
            })
        })
    }

    rmrf(location)
    .catch()
    .then(()=> mkdir(location))
    .then(()=> CRXdownload(MM_URL, location, METAMASK_PATH))
    .then(()=>{
        console.log(`CRX is located in ${MM_CRX_PATH}.`);
        console.log(`Extracting ${MM_CRX_PATH}...`)
        p7z.extractFull(MM_CRX_PATH, location)
    })
    .catch(err=> console.log('CRX download and extraction failed.\n', err))
}

(async()=>{
    await metamaskDownload()
    await fsPromises.access('utility')
    .then(()=> console.log("utility/ already exists"))
    .catch(()=> {
        fsPromises.mkdir('utility')
        .then(()=> console.log('utility/ created successfully'))
        .catch(()=> {
            console.log('Failed to create utility')
            exit(1)
        })
    })
    await sleep(5000)

    const browser = await chromium.launchPersistentContext(`${ROOT_PATH}${CONFIG_NEW.USER_DATA_DIR}`, {
        headless: false,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`
        ],
        slowMo: 500
    })
    await setupUtility(browser)
    /*
    await sleep(5000)
    await metamaskLogin(browser)
    .then(()=>console.log('Logged into MetaMask'))
    //await browser.pages()[0].pause()
    await tempusMetamaskConnect(browser)
    .then(()=>console.log('Connected to Tempus via Metamask'))
    //await browser.pages()[0].pause()
    */
    await browser.close()
    exit(0)
})()

