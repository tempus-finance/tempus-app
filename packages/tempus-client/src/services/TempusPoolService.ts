import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, ethers } from 'ethers';
import { TypedEvent } from '../abi/commons';
import { TempusPool } from '../abi/TempusPool';
import { Ticker } from '../interfaces';
import PriceOracleService from './PriceOracleService';

type TempusPoolsMap = { [key: string]: TempusPool };

type TempusPoolServiceParameters = {
  Contract: any;
  tempusPoolAddresses: string[];
  TempusPoolABI: any;
  priceOracleService: PriceOracleService;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
};

// I need to define event types like this, because TypeChain plugin for Hardhat does not generate them.
// TODO - Use event types from auto generated contract typings file when TypeChain plugin for Hardhat adds them.
// See: https://github.com/ethereum-ts/TypeChain/issues/454
export type DepositedEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber] & {
    depositor: string;
    recipient: string;
    yieldTokenAmount: BigNumber;
    shareAmounts: BigNumber;
    rate: BigNumber;
  }
>;
export type RedeemedEvent = TypedEvent<
  [string, BigNumber, BigNumber, BigNumber, BigNumber] & {
    redeemer: string;
    principalAmount: BigNumber;
    yieldAmount: BigNumber;
    yieldBearingAmount: BigNumber;
    rate: BigNumber;
  }
>;

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

  public getBackingTokenTicker(address: string): Promise<Ticker> {
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      // TODO - When backend team adds backing token ticker attribute on TempusPool contract, use it instead of hardcoded DAI value.
      return Promise.resolve('dai');
    }
    throw new Error(`Address '${address}' is not valid`);
  }

  public async getDepositedEvents(address: string): Promise<DepositedEvent[]> {
    const tempusPoolContract = this.tempusPoolsMap[address];

    if (tempusPoolContract) {
      try {
        return await tempusPoolContract.queryFilter(tempusPoolContract.filters.Deposited());
      } catch (error) {
        console.error(`TempusPoolService getDepositedEvents(${address})`, error);
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }

  public async getRedeemedEvents(address: string): Promise<RedeemedEvent[]> {
    const tempusPoolContract = this.tempusPoolsMap[address];

    if (tempusPoolContract) {
      try {
        return tempusPoolContract.queryFilter(tempusPoolContract.filters.Redeemed());
      } catch (error) {
        console.error(`TempusPoolService getRedeemEvents(${address})`, error);
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
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
      } catch (error) {
        console.error('TempusPoolService getVariableAPY()', error);
        return Promise.reject(error);
      }
    }

    throw new Error(`Address '${address}' is not valid`);
  }
}

export default TempusPoolService;
