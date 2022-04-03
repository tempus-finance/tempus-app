// playwright.config.js
// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    reporter: [['junit', { outputFile: process.env.CI ? '/root/project/test-results/results.xml' : './test-results/results.xml' }]],
    use: {
        screenshot: 'only-on-failure',
        video: 'on',
        trace: 'retain-on-failure',
    },
    testDir: 'tests',
    retries: 1,
    timeout: 50000,
    outputDir: process.env.CI ? '/root/project/test-results' : './test-results',
};

module.exports = config;
