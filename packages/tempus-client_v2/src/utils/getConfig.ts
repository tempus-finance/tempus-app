import { getCookie } from 'tempus-core-services';
import { Chain, Config, ChainConfig, TempusPool } from 'tempus-core-services';
import config from '../config/config';

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

export function getChainConfig(chain: Chain): ChainConfig {
  const configData = getConfig();

  return configData[chain];
}

export function getConfigForPoolWithId(poolId: string): TempusPool {
  const configData = getConfig();

  const tempusPoolsConfig: TempusPool[] = [];
  for (const networkName in configData) {
    tempusPoolsConfig.push(...configData[networkName as Chain].tempusPools);
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
  const configData = getConfig();

  const tempusPoolsConfig: TempusPool[] = [];
  for (const networkName in configData) {
    tempusPoolsConfig.push(...configData[networkName as Chain].tempusPools);
  }

  const poolConfig = tempusPoolsConfig.find(tempusPool => {
    return tempusPool.address === poolAddress;
  });
  if (!poolConfig) {
    throw new Error(`Failed to get pool config with pool address ${poolAddress}`);
  }

  return poolConfig;
}

const poolToChainConfigMap = new Map<string, ChainConfig>();
export function getChainConfigForPool(poolAddress: string): ChainConfig {
  const cachedResult = poolToChainConfigMap.get(poolAddress);
  if (cachedResult) {
    return cachedResult;
  }

  const configData = getConfig();

  for (const chainName in configData) {
    const chainConfig = configData[chainName as Chain];

    const poolIndex = chainConfig.tempusPools.findIndex(tempusPoolConfig => tempusPoolConfig.address === poolAddress);

    if (poolIndex > -1) {
      poolToChainConfigMap.set(poolAddress, chainConfig);

      return chainConfig;
    }
  }

  throw new Error(`Failed to find chain config for pool with address '${poolAddress}'!`);
}
