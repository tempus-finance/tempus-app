// playwright.config.js
// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    reporter: [['junit', { outputFile: 'results.xml' }]],
    use: {
        screenshot: 'only-on-failure',
    },
    testDir: 'tests',
    retries: 2,
    timeout: 90000,
    outputDir: process.env.CI ? '/root/project/test-results' : './test-results',
};

module.exports = config;
