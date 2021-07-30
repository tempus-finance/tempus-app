// External libraries
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { ethers } from 'ethers';

// Contract Typings
import { TempusPool } from '../abi/TempusPool';

// Services
import PriceOracleService from './PriceOracleService';

type TempusPoolsMap = { [key: string]: TempusPool };

type TempusPoolServiceParameters = {
  Contract: any;
  tempusPoolAddresses: string[];
  TempusPoolABI: any;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
};

class TempusPoolService {
  private readonly SECONDS_IN_A_DAY = 86400;
  private readonly BLOCK_DURATION_SECONDS = 15;

  private poolAddresses: string[] = [];
  private tempusPoolsMap: TempusPoolsMap = {};

  init({ Contract, tempusPoolAddresses = [], TempusPoolABI = {}, signerOrProvider }: TempusPoolServiceParameters) {
    this.poolAddresses = [...tempusPoolAddresses];
    this.tempusPoolsMap = {};

    this.poolAddresses.forEach((address: string) => {
      this.tempusPoolsMap[address] = new Contract(address, TempusPoolABI, signerOrProvider) as TempusPool;
    });
  }

  getPoolAddresses(): string[] {
    return this.poolAddresses;
  }

  getCurrentExchangeRate(address: string): Promise<number> {
    if (this.tempusPoolsMap[address] !== undefined) {
      return this.tempusPoolsMap[address]
        .currentExchangeRate()
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

  public async getPriceOracleForPool(address: string): Promise<PriceOracleService> {
    if (this.tempusPoolsMap[address] !== undefined) {
      const tempusPool = this.tempusPoolsMap[address];

      try {
        const priceOracleAddress = await tempusPool.priceOracle();

        return new PriceOracleService(priceOracleAddress);
      } catch (error) {
        console.error('TempusPoolService getPriceOracleForPool', error);
      }
    }
    throw new Error(`Address '${address}' is not valid`);
  }

  public async getVariableAPY(address: string) {
    const tempusPool = this.tempusPoolsMap[address];

    if (tempusPool) {
      const latestBlock = await tempusPool.provider.getBlock('latest');
      const pastBlock = await tempusPool.provider.getBlock(
        latestBlock.number - this.SECONDS_IN_A_DAY / this.BLOCK_DURATION_SECONDS,
      );

      const priceOracle = await this.getPriceOracleForPool(address);
      const yieldBearingTokenAddress = await tempusPool.yieldBearingToken();

      const currentExchangeRate = await priceOracle.currentRate(yieldBearingTokenAddress);
      const pastExchangeRate = await priceOracle.currentRate(yieldBearingTokenAddress, {
        blockTag: latestBlock.number - this.SECONDS_IN_A_DAY / this.BLOCK_DURATION_SECONDS,
      });

      if (!currentExchangeRate || !pastExchangeRate) {
        return;
      }

      const blockRateDiff = currentExchangeRate.sub(pastExchangeRate);
      const blockTimeDiff = latestBlock.timestamp - pastBlock.timestamp;

      const totalSegments = (this.SECONDS_IN_A_DAY * 365) / blockTimeDiff;

      return totalSegments * Number(ethers.utils.formatEther(blockRateDiff)) * 100;
    }
    throw new Error(`Address '${address}' is not valid`);
  }
}

export default TempusPoolService;
