"use strict";

const { download: CRXdownload } = require('download-crx');
const p7z = require('node-7z');
const path = require('path');
const { mkdir } = require('commandir');
const rimraf = require('rimraf');
const MM_URL = 'https://chrome.google.com/webstore/detail/nkbihfbeogaeaoehlefnkodbefgpgknn';

const METAMASK_PATH = 'integration-testing/mm';
async function metamaskDownload(location = path.join(__dirname, '../../', METAMASK_PATH)) {
    const MM_CRX_PATH = path.join(location, 'mm.crx');

    const rmrf = (filePath) => {
        return new Promise((resolve, reject) => {
            rimraf(filePath, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            })
        })
    }

    rmrf(location)
        .catch()
        .then(() => mkdir(location))
        .then(() => CRXdownload(MM_URL, location, 'mm'))
        .then(() => {
            console.log(`CRX is located in ${MM_CRX_PATH}.`);
            console.log(`Extracting ${MM_CRX_PATH}...`);
            p7z.extractFull(MM_CRX_PATH, location);
        })
        .then(() => console.log("Successful Metamask download and extraction."))
        .catch(err => console.log('CRX download and extraction failed.\n', err));
}

(async () => {
    await metamaskDownload();
})();