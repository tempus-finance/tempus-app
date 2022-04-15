'use strict'

module.exports = {chromiumPersistant}
const ROOT_PATH = '../'
const { chromium, firefox } = require('playwright')
const {USER_DATA_DIR, METAMASK_PATH, BROWSER_WIDTH, BROWSER_HEIGHT,
    LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT, LOAD_LONG_TIMEOUT } = require(`${ROOT_PATH}utility/config.json`)
const EXTENSION_PATH = require('path').join(__dirname, ROOT_PATH, METAMASK_PATH)

async function chromiumPersistant(args={}){
    return await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: false,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`
        ],
        slowMo: args.slowMo ?? LOAD_TIMEOUT,
        viewport: {
            width: args.width ?? BROWSER_WIDTH,
            height: args.height ?? BROWSER_HEIGHT
        }
    })
}
//TODO same for firefox


//(_slowMo=LOAD_TIMEOUT, _width=1500, _height=1000)