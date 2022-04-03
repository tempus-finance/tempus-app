// playwright.config.js
// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    reporter: [
        ['list']
    ],
    use: {
        screenshot: 'on',
        video: 'on',
        trace: 'on',
    },
    testDir: 'tests',
    retries: 0,
    timeout: 50000,
    outputDir: process.env.CI ? '/root/project/test-results' : './test-results',
};

module.exports = config;
