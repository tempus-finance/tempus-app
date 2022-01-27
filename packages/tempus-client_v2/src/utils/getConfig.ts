import { Config, ChainConfig } from '../interfaces/Config';
import { TempusPool } from '../interfaces/TempusPool';
import config from '../config/config';
import { Chain } from '../interfaces/Chain';
import getCookie from './getCookie';

export function getConfig(): Config {
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

export function getNetworkConfig(chain: Chain): ChainConfig {
  const overridingConfig = getCookie('TEMPUS_OVERRIDING_CONFIG');
  // Return default config if cookie config is not specified - empty config for now.
  if (!overridingConfig) {
    const networkConfig = config[chain];
    if (!networkConfig) {
      throw new Error(`Failed to get config for ${chain} network from config!`);
    }
    return networkConfig;
  }

  try {
    return JSON.parse(overridingConfig)[chain];
  } catch (error) {
    console.error('Failed to parse environment config from cookie. Using default config as a fallback.');
    const networkConfig = config[chain];
    if (!networkConfig) {
      throw new Error(`Failed to get config for ${chain} network from cookie!`);
    }
    return networkConfig;
  }
}

export function getConfigForPoolWithId(poolId: string): TempusPool {
  const config = getConfig();

  const tempusPoolsConfig: TempusPool[] = [];
  for (const networkName in config) {
    tempusPoolsConfig.push(...config[networkName as Chain].tempusPools);
  }

  const poolConfig = tempusPoolsConfig.find(tempusPool => {
    return tempusPool.poolId === poolId;
  });
  if (!poolConfig) {
    throw new Error(`Failed to get pool config with pool id ${poolId}`);
  }

  return poolConfig;
}

export function getConfigForPoolWithAddress(poolAddress: string): TempusPool {
  const config = getConfig();

  const tempusPoolsConfig: TempusPool[] = [];
  for (const networkName in config) {
    tempusPoolsConfig.push(...config[networkName as Chain].tempusPools);
  }

  const poolConfig = tempusPoolsConfig.find(tempusPool => {
    return tempusPool.address === poolAddress;
  });
  if (!poolConfig) {
    throw new Error(`Failed to get pool config with pool address ${poolAddress}`);
  }

  return poolConfig;
}
