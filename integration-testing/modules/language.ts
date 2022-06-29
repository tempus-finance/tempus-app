import Words from '../utility/localisation/words';
import en from '../utility/localisation/en';
import es from '../utility/localisation/es';
import it from '../utility/localisation/it';
import { Page } from 'playwright';

export const LANGUAGE_CODES: string[] = ['en', 'es', 'it'];
export type Language = { [word in Words]: string };
const langs: Map<string, Language> = new Map([['en', en], ['es', es], ['it', it],]);
const langCodeToName: Map<string, string> = new Map([['en', 'English'], ['es', 'Español'], ['it', 'Italiano'],]);

export async function langaugeSwitch(page: Page, langCurrent: Language, langCode: string): Promise<Language> {
    await page.click(`text=${langCurrent.settings}`);
    await page.click('div[data-variant="dropdown-text"] >> nth=2');
    const langName: string = getLangName(langCode);
    await page.click(`text="${langName}"`);

    const langNew: Language = languageGenerator(langCode);
    return langNew;
}

export function languageGenerator(langCode: string): Language {
    const lang: Language | undefined = langs.get(langCode);
    if (lang == undefined) {
        throw new Error(`Langauge ${langCode} isn't supported`);
    }
    return lang;
}

export function getLangName(langCode: string): string {
    const langName: string | undefined = langCodeToName.get(langCode);
    if (langName == undefined) {
        throw new Error(`Langauge ${langCode} isn't supported`);
    }
    return langName;
}
