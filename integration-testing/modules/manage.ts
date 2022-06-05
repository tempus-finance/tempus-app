import { BrowserContext, Page } from "playwright";
import { tempusManageCurrency } from "./tempushome";
import { LOAD_SHORT_TIMEOUT, LOAD_TIMEOUT }
    from "../utility/constants";
import { Language, languageGenerator } from "./language";


export async function manageDeposit
    (browser: BrowserContext, amount: string = '1', asset: string = 'USDC',
        token: string = 'USDC', fixedYield: boolean = true, langCode: string = 'en'): Promise<void> {
    const lang: Language = languageGenerator(langCode);
    const tabManage: Page = await tempusManageCurrency(browser, asset, langCode);

    //this will be a separate function/test
    await tabManage.click(`text="${lang.settings}"`);
    await tabManage.click(`text="${lang.auto}"`);
    await tabManage.mouse.click(300, 300); // hardcoded for 16:9 full HD monitor

    await tabManage.click(`text="${lang.deposit}"`);
    await tabManage.click('.MuiSelect-root');
    await tabManage.click(`.MuiButtonBase-root :text("${token}") >> nth=0`);
    await tabManage.waitForTimeout(LOAD_SHORT_TIMEOUT);
    await tabManage.fill('input[type="text"]', amount);

    if (fixedYield) {
        await tabManage.click(`text="${lang.fixedYield}"`);
    }
    else {
        await tabManage.click(`text="${lang.variableYield}"`);
    }

    //const tabCount = browser.pages().length;
    await tabManage.waitForTimeout(LOAD_TIMEOUT * 5);
    await tabManage.click(`text="${lang.execute}"`);
    await tabManage.waitForTimeout(LOAD_TIMEOUT * 10); // possible error if slow machine

    const mm = await browser.pages().slice(-1)[0];
    await mm.click(`text="Confirm"`);

    await tabManage.waitForTimeout(LOAD_TIMEOUT);
    await tabManage.pause();

    await tabManage.close();
}
