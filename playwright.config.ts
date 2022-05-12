// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    reporter: [['junit', { outputFile: './test-results/results.xml' }]],
    use: {
        screenshot: 'on',
        video: 'on',
        trace: 'on',
    },
    testDir: 'integration-testing/tests',
    retries: process.env.CI ? 1 : 0,
    timeout: 50000,
    outputDir: process.env.CI ? '/root/project/test-results' : './test-results',

};
export default config;
