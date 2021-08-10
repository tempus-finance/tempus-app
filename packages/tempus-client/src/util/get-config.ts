import cookie from 'js-cookie';

import { Config } from '../interfaces';

import config from '../config';

export default function getConfig(): Config {
  const localConfig = cookie.get('TEMPUS_ENVIRONMENT_CONFIG');
  // Return default config if cookie config is not specified - empty config for now.
  // Once we go to testnet we should probably set testnet as a default config.
  // Once we go to mainnet we should set mainnet as a default config.
  if (!localConfig) {
    return config;
  } else {
    return JSON.parse(localConfig);
  }
}
