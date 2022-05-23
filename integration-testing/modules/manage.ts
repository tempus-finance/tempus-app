import { BrowserContext, Page } from "playwright";
import { tempusManageCurrency } from "./tempushome";
import { LOAD_TIMEOUT, LOAD_SHORT_TIMEOUT }
    from "../utility/constants";


export async function manageDeposit
    (browser: BrowserContext, amount: string = '1', asset: string = 'USDC',
        token: string = 'USDC', fixedYield: boolean = true): Promise<void> {
    const tabManage: Page = await tempusManageCurrency(browser, asset)
    await tabManage.click('text="Deposit"');
    await tabManage.click('.MuiSelect-root');
    await tabManage.click(`.MuiButtonBase-root :text("${token}") >> nth=0`);
    await tabManage.waitForTimeout(LOAD_SHORT_TIMEOUT);
    await tabManage.fill('input[type="text"]', amount);

    if (fixedYield) {
        await tabManage.click('text="Fixed Yield"');
    }
    else {
        await tabManage.click('text="Variable Yield"');
    }

    const tabCount = browser.pages().length;
    await tabManage.click('text="Approve"');
    await tabManage.waitForTimeout(LOAD_TIMEOUT);

    if (await browser.pages().length > tabCount) {
        const mm = await browser.pages().slice(-1)[0]
        if (await mm.locator('text="Approve"').count()) {
            await mm.click('text="Approve"');
        }
        else {
            await mm.click('text="Reject"');
        }

        await mm.waitForTimeout(LOAD_TIMEOUT);
        await mm.click('button:has-text("Switch network")');
    }

    await tabManage.close();
}
