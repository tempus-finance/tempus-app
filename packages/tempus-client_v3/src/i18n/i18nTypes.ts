const isDev = process.env.NODE_ENV === 'development';

const supportedLocales = ['en', 'es', 'it'] as const;
const devSupportedLocales = ['en', 'es', 'it', 'zz'] as const;

export const SUPPORTED_LOCALES = isDev ? devSupportedLocales : supportedLocales;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
