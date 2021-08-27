import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, ContractTransaction, ethers } from 'ethers';
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

  public async deposit(
    address: string,
    amount: BigNumber,
    recipient: string,
  ): Promise<ContractTransaction | undefined> {
    const tempusPool = this.tempusPoolsMap[address];
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
