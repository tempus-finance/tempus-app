import { Config } from '../interfaces/Config';
import { TempusPool } from '../interfaces/TempusPool';
import config from '../config/config';
import getCookie from './getCookie';
import { selectedChainState } from '../state/ChainState';

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

export function getConfigForPoolWithId(poolId: string): TempusPool {
  const poolConfig = getConfig()[selectedChainState.get()].tempusPools.find(tempusPool => {
    return tempusPool.poolId === poolId;
  });
  if (!poolConfig) {
    throw new Error(`Failed to get pool config with pool id ${poolId}`);
  }

  return poolConfig;
}

export function getConfigForPoolWithAddress(poolAddress: string): TempusPool {
  const poolConfig = getConfig()[selectedChainState.get()].tempusPools.find(tempusPool => {
    return tempusPool.address === poolAddress;
  });
  if (!poolConfig) {
    throw new Error(`Failed to get pool config with pool address ${poolAddress}`);
  }

  return poolConfig;
}
