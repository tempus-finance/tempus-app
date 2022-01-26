import { Config, NetworkConfig } from '../interfaces/Config';
import { TempusPool } from '../interfaces/TempusPool';
import config from '../config/config';
import getCookie from './getCookie';
import { Networks } from '../state/NetworkState';

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

export function getNetworkConfig(network: Networks): NetworkConfig {
  const overridingConfig = getCookie('TEMPUS_OVERRIDING_CONFIG');
  // Return default config if cookie config is not specified - empty config for now.
  if (!overridingConfig) {
    const networkConfig = config[network];
    if (!networkConfig) {
      throw new Error(`Failed to get config for ${network} network from config!`);
    }
    return networkConfig;
  }

  try {
    return JSON.parse(overridingConfig)[network];
  } catch (error) {
    console.error('Failed to parse environment config from cookie. Using default config as a fallback.');
    const networkConfig = config[network];
    if (!networkConfig) {
      throw new Error(`Failed to get config for ${network} network from cookie!`);
    }
    return networkConfig;
  }
}

export function getConfigForPoolWithId(poolId: string): TempusPool {
  const config = getConfig();

  const tempusPoolsConfig: TempusPool[] = [];
  for (const networkName in config) {
    tempusPoolsConfig.push(...config[networkName as Networks].tempusPools);
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
    tempusPoolsConfig.push(...config[networkName as Networks].tempusPools);
  }

  const poolConfig = tempusPoolsConfig.find(tempusPool => {
    return tempusPool.address === poolAddress;
  });
  if (!poolConfig) {
    throw new Error(`Failed to get pool config with pool address ${poolAddress}`);
  }

  return poolConfig;
}
