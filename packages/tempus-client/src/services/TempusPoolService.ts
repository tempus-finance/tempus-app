import { BigNumber, ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { TempusPool } from '../abi/TempusPool';
import { BLOCK_DURATION_SECONDS, DAYS_IN_A_YEAR, SECONDS_IN_A_DAY } from '../constants';
import { ProtocolName, Ticker } from '../interfaces';
import getERC20TokenService from './getERC20TokenService';

type TempusPoolsMap = { [key: string]: TempusPool };

type TempusPoolServiceParameters = {
  Contract: any;
  tempusPoolAddresses: string[];
  TempusPoolABI: any;
  eRC20TokenServiceGetter: typeof getERC20TokenService;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
};

class TempusPoolService {
  private poolAddresses: string[] = [];
  private tempusPoolsMap: TempusPoolsMap = {};
  private eRC20TokenServiceGetter: typeof getERC20TokenService | null = null;

  init({
    Contract,
    tempusPoolAddresses = [],
    TempusPoolABI = {},
    signerOrProvider,
    eRC20TokenServiceGetter,
  }: TempusPoolServiceParameters) {
    this.poolAddresses = [...tempusPoolAddresses];
    this.tempusPoolsMap = {};

    this.poolAddresses.forEach((address: string) => {
      this.tempusPoolsMap[address] = new Contract(address, TempusPoolABI, signerOrProvider) as TempusPool;
    });

    this.eRC20TokenServiceGetter = eRC20TokenServiceGetter;
  }

  getPoolAddresses(): string[] {
    return this.poolAddresses;
  }

  public async getBackingTokenTicker(address: string): Promise<Ticker> {
    if (!this.eRC20TokenServiceGetter) {
      console.error('TempusPoolService - getBackingTokenTicker() - Attempted to use service before initializing it!');
      return Promise.reject();
    }

    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      let backingTokenAddress: string;
      try {
        backingTokenAddress = await tempusPool.backingToken();
      } catch (error) {
        console.error(`Failed to get BT address for Tempus Pool ${address}`);
        return Promise.reject(error);
      }

      return this.eRC20TokenServiceGetter(backingTokenAddress).symbol();
    }
    throw new Error(`Address '${address}' is not valid`);
  }

  public async getYieldBearingTokenTicker(address: string): Promise<Ticker> {
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      let yieldBearingTokenAddress: string;
      try {
        yieldBearingTokenAddress = await tempusPool.yieldBearingToken();
      } catch (error) {
        console.error(`Failed to get YBT address for Tempus Pool ${address}`);
        return Promise.reject(error);
      }

      return getERC20TokenService(yieldBearingTokenAddress).symbol();
    }
    throw new Error(`Address '${address}' is not valid`);
  }

  public async getProtocolName(address: string): Promise<ProtocolName> {
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      try {
        return ethers.utils.parseBytes32String(await tempusPool.protocolName()).toLowerCase() as ProtocolName;
      } catch (error) {
        console.error('TempusPoolService - getProtocolName() - Failed to fetch protocol name', error);
        return Promise.reject(error);
      }
    }
    throw new Error(`Address '${address}' is not valid`);
  }

  getCurrentExchangeRate(address: string): Promise<number> {
    if (this.tempusPoolsMap[address] !== undefined) {
      return this.tempusPoolsMap[address]
        .currentInterestRate()
        .then((data: any) => Promise.resolve(data.toBigInt()))
        .catch((error: Error) => {
          console.error('ContractDataService getCurrentExchangeRate error', error);
          return Promise.reject(error);
        });
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  getMaturityTime(address: string): Promise<Date> {
    if (this.tempusPoolsMap[address] !== undefined) {
      return this.tempusPoolsMap[address]
        .maturityTime()
        .then((data: any) => Promise.resolve(new Date(data.toNumber() * 1000)))
        .catch((error: Error) => {
          console.error('ContractDataService getMaturityTime', error);
          return Promise.reject(error);
        });
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async getStartTime(address: string): Promise<Date> {
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool !== undefined) {
      try {
        return new Date((await tempusPool.startTime()).toNumber() * 1000);
      } catch (error) {
        console.error('TempusPoolService getStartTime', error);
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async getVariableAPY(address: string): Promise<number> {
    const tempusPool = this.tempusPoolsMap[address];

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
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      return tempusPool.pricePerYieldShareStored();
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async pricePerPrincipalShareStored(address: string): Promise<BigNumber> {
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      return tempusPool.pricePerPrincipalShareStored();
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public getYieldTokenAddress(address: string): Promise<string> {
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      return tempusPool.yieldShare();
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public getPrincipalsTokenAddress(address: string): Promise<string> {
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      return tempusPool.principalShare();
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public getBackingTokenAddress(address: string): Promise<string> {
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      return tempusPool.backingToken();
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public getYieldBearingTokenAddress(address: string): Promise<string> {
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      return tempusPool.yieldBearingToken();
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async numAssetsPerYieldToken(
    address: string,
    yieldTokenAmount: BigNumber,
    interestRate: BigNumber,
  ): Promise<BigNumber> {
    const tempusPool = this.tempusPoolsMap[address];

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

  async initialInterestRate(address: string): Promise<BigNumber> {
    const contract = this.tempusPoolsMap[address];
    if (contract) {
      try {
        return await contract.initialInterestRate();
      } catch (error) {
        console.error('TempusPoolService - initialInterestRate() - Failed to fetch initial interest rate!', error);
        return Promise.reject(error);
      }
    }
    throw new Error(`TempusPoolService - currentInterestRate() - Address '${address}' is not valid`);
  }

  public async currentInterestRate(address: string): Promise<BigNumber> {
    const contract = this.tempusPoolsMap[address];
    if (contract) {
      try {
        return await contract.currentInterestRate();
      } catch (error) {
        console.error('TempusPoolService - currentInterestRate() - Failed to fetch interest rate!', error);
        return Promise.reject(error);
      }
    }
    throw new Error(`TempusPoolService - currentInterestRate() - Address '${address}' is not valid`);
  }

  async getFeesConfig(address: string): Promise<BigNumber[]> {
    const contract = this.tempusPoolsMap[address];
    if (contract) {
      try {
        return await contract.getFeesConfig();
      } catch (error) {
        console.error('TempusPoolService - getFeesConfig() - Failed to fetch pool fees.', error);
        return Promise.reject(error);
      }
    }
    throw new Error(`TempusPoolService - getFeesConfig() - Address '${address}' is not valid`);
  }
}

export default TempusPoolService;
