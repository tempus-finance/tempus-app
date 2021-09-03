import { BigNumber, Contract, ContractTransaction, ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { TempusPool } from '../abi/TempusPool';
import TempusPoolABI from '../abi/TempusPool.json';
import { BLOCK_DURATION_SECONDS, DAYS_IN_A_YEAR, SECONDS_IN_A_DAY } from '../constants';
import { ProtocolName, Ticker } from '../interfaces';
import getERC20TokenService from './getERC20TokenService';
import {
  backingTokenAddressCache,
  maturityTimeCache,
  principalShareTokenAddressCache,
  protocolNameCache,
  startTimeCache,
  yieldBearingTokenAddressCache,
  yieldShareTokenAddressCache,
} from '../cache/TempusPoolCache';

type TempusPoolServiceParameters = {
  Contract: typeof Contract;
  tempusPoolAddresses: string[];
  TempusPoolABI: typeof TempusPoolABI;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
};

class TempusPoolService {
  private tempusPoolsMap: Map<string, TempusPool> = new Map();

  init({ Contract, tempusPoolAddresses = [], TempusPoolABI, signerOrProvider }: TempusPoolServiceParameters) {
    this.tempusPoolsMap.clear();

    tempusPoolAddresses.forEach((address: string) => {
      this.tempusPoolsMap.set(address, new Contract(address, TempusPoolABI, signerOrProvider) as TempusPool);
    });
  }

  public async getBackingTokenTicker(address: string): Promise<Ticker> {
    let backingTokenAddress: string;
    try {
      backingTokenAddress = await this.getBackingTokenAddress(address);
    } catch (error) {
      console.error(`Failed to get backing token address for Tempus Pool '${address}'`);
      return Promise.reject(error);
    }

    return getERC20TokenService(backingTokenAddress).symbol();
  }

  public async getBackingTokenAddress(address: string): Promise<string> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool) {
      const cachedPromise = backingTokenAddressCache.get(address);
      if (cachedPromise) {
        return cachedPromise;
      }

      try {
        const backingTokenAddressPromise = tempusPool.backingToken();
        backingTokenAddressCache.set(address, backingTokenAddressPromise);

        return backingTokenAddressPromise;
      } catch (error) {
        console.error('TempusPoolService - getBackingTokenAddress() - Failed to fetch backing token address!', error);
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async getYieldBearingTokenTicker(address: string): Promise<Ticker> {
    let yieldBearingTokenAddress: string;
    try {
      yieldBearingTokenAddress = await this.getYieldBearingTokenAddress(address);
    } catch (error) {
      console.error(`Failed to get YBT address for Tempus Pool ${address}`);
      return Promise.reject(error);
    }

    return getERC20TokenService(yieldBearingTokenAddress).symbol();
  }

  public async getProtocolName(address: string): Promise<ProtocolName> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool) {
      const cachedProtocolNamePromise = protocolNameCache.get(address);
      if (cachedProtocolNamePromise) {
        return ethers.utils.parseBytes32String(await cachedProtocolNamePromise).toLowerCase() as ProtocolName;
      }

      try {
        const fetchProtocolNamePromise = tempusPool.protocolName();
        protocolNameCache.set(address, fetchProtocolNamePromise);

        return ethers.utils.parseBytes32String(await fetchProtocolNamePromise).toLowerCase() as ProtocolName;
      } catch (error) {
        console.error('TempusPoolService - getProtocolName() - Failed to fetch protocol name', error);
        return Promise.reject(error);
      }
    }
    throw new Error(`Address '${address}' is not valid`);
  }

  public async getCurrentExchangeRate(address: string): Promise<bigint> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool) {
      try {
        return (await tempusPool.currentInterestRate()).toBigInt();
      } catch (error) {
        console.error('ContractDataService getCurrentExchangeRate error', error);
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async getMaturityTime(address: string): Promise<Date> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool) {
      const cachedMaturityTimePromise = maturityTimeCache.get(address);
      if (cachedMaturityTimePromise) {
        return new Date((await tempusPool.maturityTime()).toNumber() * 1000);
      }

      try {
        const fetchMaturityTimePromise = tempusPool.maturityTime();
        maturityTimeCache.set(address, fetchMaturityTimePromise);

        return new Date((await fetchMaturityTimePromise).toNumber() * 1000);
      } catch (error) {
        console.error('ContractDataService getMaturityTime', error);
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async getStartTime(address: string): Promise<Date> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool !== undefined) {
      const cachedStartTimePromise = startTimeCache.get(address);
      if (cachedStartTimePromise) {
        return new Date((await cachedStartTimePromise).toNumber() * 1000);
      }

      try {
        const fetchStartTimePromise = tempusPool.startTime();
        startTimeCache.set(address, fetchStartTimePromise);

        return new Date((await fetchStartTimePromise).toNumber() * 1000);
      } catch (error) {
        console.error('TempusPoolService getStartTime', error);
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async getVariableAPY(address: string): Promise<number> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool) {
      try {
        const latestBlock = await tempusPool.provider.getBlock('latest');

        const [pastBlock, currentExchangeRate, pastExchangeRate] = await Promise.all([
          tempusPool.provider.getBlock(latestBlock.number - SECONDS_IN_A_DAY / BLOCK_DURATION_SECONDS),
          tempusPool.currentInterestRate(),
          tempusPool.currentInterestRate({
            blockTag: latestBlock.number - SECONDS_IN_A_DAY / BLOCK_DURATION_SECONDS,
          }),
        ]);

        if (!currentExchangeRate || !pastExchangeRate) {
          console.error('TempusPoolService getVariableAPY() - Failed to fetch current/past exchange rates.');
          return Promise.reject(0);
        }

        const blockRateDiff = currentExchangeRate.sub(pastExchangeRate);
        const blockTimeDiff = latestBlock.timestamp - pastBlock.timestamp;

        const totalSegments = (SECONDS_IN_A_DAY * DAYS_IN_A_YEAR) / blockTimeDiff;

        return totalSegments * Number(ethers.utils.formatEther(blockRateDiff)) * 100;
      } catch (error) {
        console.error('TempusPoolService getVariableAPY()', error);
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async pricePerYieldShareStored(address: string): Promise<BigNumber> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool) {
      return tempusPool.pricePerYieldShareStored();
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async pricePerPrincipalShareStored(address: string): Promise<BigNumber> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool) {
      return tempusPool.pricePerPrincipalShareStored();
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public getYieldShareTokenAddress(address: string): Promise<string> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool) {
      const cachedYieldShareTokenAddressPromise = yieldShareTokenAddressCache.get(address);
      if (cachedYieldShareTokenAddressPromise) {
        return cachedYieldShareTokenAddressPromise;
      }

      try {
        const fetchYieldShareTokenAddressPromise = tempusPool.yieldShare();
        yieldShareTokenAddressCache.set(address, fetchYieldShareTokenAddressPromise);

        return fetchYieldShareTokenAddressPromise;
      } catch (error) {
        console.log('TempusPoolService - getYieldTokenAddress() - Failed to fetch yield share token address!', error);
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public getPrincipalTokenAddress(address: string): Promise<string> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool) {
      const cachedPrincipalShareTokenAddressPromise = principalShareTokenAddressCache.get(address);
      if (cachedPrincipalShareTokenAddressPromise) {
        return cachedPrincipalShareTokenAddressPromise;
      }

      try {
        const fetchPrincipalShareTokenAddressPromise = tempusPool.principalShare();
        principalShareTokenAddressCache.set(address, fetchPrincipalShareTokenAddressPromise);

        return fetchPrincipalShareTokenAddressPromise;
      } catch (error) {
        console.log(
          'TempusPoolService - getPrincipalTokenAddress() - Failed to fetch principal share token address!',
          error,
        );
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public getYieldBearingTokenAddress(address: string): Promise<string> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool) {
      const cachedYieldBearingTokenAddressPromise = yieldBearingTokenAddressCache.get(address);
      if (cachedYieldBearingTokenAddressPromise) {
        return cachedYieldBearingTokenAddressPromise;
      }

      try {
        const fetchYieldBearingTokenAddressPromise = tempusPool.yieldBearingToken();
        yieldBearingTokenAddressCache.set(address, fetchYieldBearingTokenAddressPromise);

        return fetchYieldBearingTokenAddressPromise;
      } catch (error) {
        console.error(
          'TempusPoolService - getYieldBearingTokenAddress() - Failed to fetch yield bearing token address!',
          error,
        );
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async numAssetsPerYieldToken(
    address: string,
    yieldTokenAmount: number,
    interestRate: number,
  ): Promise<BigNumber> {
    const tempusPool = this.tempusPoolsMap.get(address);

    if (tempusPool) {
      try {
        return tempusPool.numAssetsPerYieldToken(yieldTokenAmount, interestRate);
      } catch (error) {
        console.error(
          `TempusPoolService - numAssetsPerYieldToken() - Failed to retrieve num of asset per yield token`,
          error,
        );
        return Promise.reject();
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async deposit(
    address: string,
    amount: BigNumber,
    recipient: string,
  ): Promise<ContractTransaction | undefined> {
    const tempusPool = this.tempusPoolsMap.get(address);
    if (tempusPool) {
      let depositTransaction: ContractTransaction | undefined;
      try {
        depositTransaction = await tempusPool.deposit(amount, recipient);
      } catch (error) {
        console.error(`TempusPoolService - deposit() - Failed to make a deposit to the pool!`, error);
        return Promise.reject(error);
      }
      return depositTransaction;
    }
    throw new Error(`Address '${address}' is not valid`);
  }
}

export default TempusPoolService;
