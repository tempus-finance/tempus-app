import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, ethers } from 'ethers';
import { TypedEvent } from '../abi/commons';
import { TempusPool } from '../abi/TempusPool';
import { ProtocolName, Ticker } from '../interfaces';
import getERC20TokenService from './getERC20TokenService';

type TempusPoolsMap = { [key: string]: TempusPool };

type TempusPoolServiceParameters = {
  Contract: any;
  tempusPoolAddresses: string[];
  TempusPoolABI: any;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
};

// I need to define event types like this, because TypeChain plugin for Hardhat does not generate them.
// TODO - Use event types from auto generated contract typings file when TypeChain plugin for Hardhat adds them.
// See: https://github.com/ethereum-ts/TypeChain/issues/454
export type DepositedEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber, BigNumber] & {
    depositor: string;
    recipient: string;
    yieldTokenAmount: BigNumber;
    backingTokenValue: BigNumber;
    shareAmounts: BigNumber;
    interestRate: BigNumber;
  }
>;
export type RedeemedEvent = TypedEvent<
  [string, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
    redeemer: string;
    principalShareAmount: BigNumber;
    yieldShareAmount: BigNumber;
    yieldBearingAmount: BigNumber;
    backingTokenValue: BigNumber;
    interestRate: BigNumber;
  }
>;

class TempusPoolService {
  private readonly DAYS_IN_A_YEAR = 365;
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

  public async getBackingTokenTicker(address: string): Promise<Ticker> {
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      let backingTokenAddress: string;
      try {
        backingTokenAddress = await tempusPool.backingToken();
      } catch (error) {
        console.error(`Failed to get BT address for Tempus Pool ${address}`);
        return Promise.reject(error);
      }

      return getERC20TokenService(backingTokenAddress).symbol();
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
          tempusPool.provider.getBlock(latestBlock.number - this.SECONDS_IN_A_DAY / this.BLOCK_DURATION_SECONDS),
          tempusPool.currentInterestRate(),
          tempusPool.currentInterestRate({
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

  public getPrincipalTokenAddress(address: string): Promise<string> {
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

  public deposit(
    address: string,
    amount: BigNumber,
    recipient: string,
  ): Promise<ethers.ContractTransaction | undefined> {
    const tempusPool = this.tempusPoolsMap[address];
    if (tempusPool) {
      return tempusPool.deposit(amount, recipient);
    }
    throw new Error(`Address '${address}' is not valid`);
  }
}

export default TempusPoolService;
