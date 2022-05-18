import { chromiumPersistant } from '../modules/browser';
import config from './config';

console.log(config);

(async () => {
    const browser = await chromiumPersistant();
    const page = await browser.newPage();
    await page.pause();
});