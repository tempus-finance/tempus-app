import { chromiumPersistant } from '../modules/browser';

(async () => {
    const browser = await chromiumPersistant();
    const page = await browser.newPage();
    await page.pause();
})()