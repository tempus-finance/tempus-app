import { Config } from '../interfaces';

import config from '../config';

import getCookie from './get-cookie';

export default function getConfig(): Config {
  const overridingConfig = getCookie('TEMPUS_OVERRIDING_CONFIG');
  // Return default config if cookie config is not specified - empty config for now.
  if (!overridingConfig) {
    return config;
  }

  try {
    return JSON.parse(overridingConfig);
  } catch (error) {
    console.error('Failed to parse environment config from cookie. Using default config as a fallback.');
    return config;
  }
}
