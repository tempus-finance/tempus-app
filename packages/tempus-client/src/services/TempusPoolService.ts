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
  priceOracleService: PriceOracleService;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
};

class TempusPoolService {
  private readonly DAYS_IN_A_YEAR = 365;
  private readonly SECONDS_IN_A_DAY = 86400;
  private readonly BLOCK_DURATION_SECONDS = 15;

  private poolAddresses: string[] = [];
  private tempusPoolsMap: TempusPoolsMap = {};
  private priceOracleService: PriceOracleService | null = null;

  init({
    Contract,
    tempusPoolAddresses = [],
    TempusPoolABI = {},
    priceOracleService,
    signerOrProvider,
  }: TempusPoolServiceParameters) {
    this.poolAddresses = [...tempusPoolAddresses];
    this.tempusPoolsMap = {};

    this.poolAddresses.forEach((address: string) => {
      this.tempusPoolsMap[address] = new Contract(address, TempusPoolABI, signerOrProvider) as TempusPool;
    });

    this.priceOracleService = priceOracleService;
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

  public async getVariableAPY(address: string): Promise<number> {
    const tempusPool = this.tempusPoolsMap[address];

    if (tempusPool) {
      const [latestBlock, priceOracleAddress, yieldBearingTokenAddress] = await Promise.all([
        tempusPool.provider.getBlock('latest'),
        tempusPool.priceOracle(),
        tempusPool.yieldBearingToken(),
      ]);

      const [pastBlock, currentExchangeRate, pastExchangeRate] = await Promise.all([
        tempusPool.provider.getBlock(latestBlock.number - this.SECONDS_IN_A_DAY / this.BLOCK_DURATION_SECONDS),
        this.priceOracleService?.currentRate(priceOracleAddress, yieldBearingTokenAddress),
        this.priceOracleService?.currentRate(priceOracleAddress, yieldBearingTokenAddress, {
          blockTag: latestBlock.number - this.SECONDS_IN_A_DAY / this.BLOCK_DURATION_SECONDS,
        }),
      ]);

      if (!currentExchangeRate || !pastExchangeRate) {
        console.error('TempusPoolService getVariableAPY() - Failed to fetch current/past exchange rates.');
        return Promise.reject(0);
      }

      const blockRateDiff = currentExchangeRate.sub(pastExchangeRate);
      const blockTimeDiff = latestBlock.timestamp - pastBlock.timestamp;

      const totalSegments = (this.SECONDS_IN_A_DAY * this.DAYS_IN_A_YEAR) / blockTimeDiff;

      return totalSegments * Number(ethers.utils.formatEther(blockRateDiff)) * 100;
    }
    throw new Error(`Address '${address}' is not valid`);
  }
}

export default TempusPoolService;
