// playwright.config.js
// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    // Concise 'dot' for CI, default 'list' when running locally
    reporter: process.env.CI ? 'dot' : 'list',
    use: {
        screenshot: 'only-on-failure',
    },
    testDir: 'tests',
    retries: 2,
    timeout: 90000,
    outputDir: '/root/project/test-results',
};

module.exports = config;
