import { ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { DashboardRow, DashboardRowChild, DashboardRowParent } from '../interfaces';
import { TempusPool } from '../interfaces/TempusPool';
import getStatisticsService from '../services/getStatisticsService';
import getTempusPoolService from '../services/getTempusPoolService';
import StatisticsService from '../services/StatisticsService';
import TempusPoolService from '../services/TempusPoolService';
import getERC20TokenService from '../services/getERC20TokenService';
import getConfig from '../utils/get-config';

type DashboardDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
  userWalletAddress: string;
};

export default class DashboardDataAdapter {
  private tempusPoolService: TempusPoolService | null = null;
  private statisticsService: StatisticsService | null = null;
  private userWalletAddress: string = '';

  public init(params: DashboardDataAdapterParameters) {
    this.tempusPoolService = getTempusPoolService(params.signerOrProvider);
    this.statisticsService = getStatisticsService(params.signerOrProvider);
    this.userWalletAddress = params.userWalletAddress;
  }

  public async getRows(): Promise<DashboardRow[]> {
    let childRows: DashboardRowChild[];
    try {
      childRows = await this.getChildRows();
    } catch (error) {
      console.error('DashboardDataAdapter - getRows() - Failed to get child rows!', error);
      return Promise.reject(error);
    }

    // Generates parent rows based on children rows
    const parentRows = this.getParentRows(childRows);

    return [...parentRows, ...childRows];
  }

  private getChildRows(): Promise<DashboardRowChild[]> {
    const childRowsDataFetchPromises: Promise<DashboardRowChild>[] = [];
    getConfig().tempusPools.forEach(tempusPool => {
      childRowsDataFetchPromises.push(this.getChildRowData(tempusPool));
    });
    return Promise.all(childRowsDataFetchPromises);
  }

  private async getChildRowData(tempusPool: TempusPool): Promise<DashboardRowChild> {
    if (!this.tempusPoolService || !this.statisticsService) {
      console.error(
        'DashboardDataAdapter - getChildRowData() - Attempted to use DashboardDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    try {
      const [
        backingTokenTicker,
        yieldBearingTokenTicker,
        protocolName,
        startDate,
        maturityDate,
        presentValueInBackingTokens,
        availableToDeposit,
      ] = await Promise.all([
        this.tempusPoolService.getBackingTokenTicker(tempusPool.address),
        this.tempusPoolService.getYieldBearingTokenTicker(tempusPool.address),
        this.tempusPoolService.getProtocolName(tempusPool.address),
        this.tempusPoolService.getStartTime(tempusPool.address),
        this.tempusPoolService.getMaturityTime(tempusPool.address),
        this.getPresentValueInBackingTokensForPool(tempusPool),
        this.getAvailableToDepositForPool(tempusPool),
      ]);

      const [tvl, poolBackingTokenRate] = await Promise.all([
        this.statisticsService.totalValueLockedUSD(tempusPool.address, backingTokenTicker),
        this.statisticsService.getRate(backingTokenTicker),
      ]);

      // TODO - Replace dummy data for each tempus pool (child row) with real data.
      return {
        id: tempusPool.address,
        parentId: backingTokenTicker,
        token: backingTokenTicker,
        supportedTokens: [backingTokenTicker, yieldBearingTokenTicker],
        protocol: protocolName,
        startDate: startDate,
        maturityDate: maturityDate,
        fixedAPY: 0.051, // TODO - Get from TempusPool controller once it's added on the backend.
        variableAPY: 0.117, // TODO - Needs to be fixed - does not take into account gains from providing liquidity, some protocol compound interest, it does not increase linearly.
        TVL: Number(ethers.utils.formatEther(tvl)),
        presentValue:
          presentValueInBackingTokens !== undefined ? presentValueInBackingTokens * poolBackingTokenRate : undefined,
        availableToDeposit:
          availableToDeposit !== undefined ? `${availableToDeposit} ${backingTokenTicker}` : undefined,
      };
    } catch (error) {
      console.error('DashboardDataAdapter - getChildRowData() - Failed to get data for child row!', error);
      return Promise.reject(error);
    }
  }

  private getParentRows(childRows: DashboardRowChild[]): DashboardRowParent[] {
    const parentRows: DashboardRowParent[] = [];

    childRows.forEach(child => {
      const childParent = this.getChildParent(child, parentRows);

      // Create child parent if it does not already exist.
      if (!childParent) {
        const parentChildren = this.getParentChildren(child.token, childRows);

        const childrenMaturityDate = parentChildren.map(child => child.maturityDate);
        const childrenFixedAPY = parentChildren.map(child => child.fixedAPY);
        const childrenVariable = parentChildren.map(child => child.variableAPY);
        const parentTVL = parentChildren.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.TVL;
        }, 0);
        const parentPresentValue = parentChildren.reduce((accumulator, currentValue) => {
          if (currentValue.presentValue) {
            return (accumulator + currentValue.presentValue) | 0;
          }
          return accumulator;
        }, 0);

        const parentRow: DashboardRowParent = {
          id: child.token, // Using token as parent ID, this way multiple children with same token will fall under same parent.
          parentId: null, // Always null for parent rows
          token: child.token,
          maturity: this.getRangeFrom<Date>(childrenMaturityDate),
          fixedAPY: this.getRangeFrom<number>(childrenFixedAPY),
          variableAPY: this.getRangeFrom<number>(childrenVariable),
          TVL: parentTVL,
          presentValue: this.userWalletAddress ? parentPresentValue : undefined,
          // availableToDeposit - Decide how we want to show multiple user tokens in the same row
          // (in case parent has multiple children with different YBT)
          availableToDeposit: parentChildren[0].availableToDeposit,
        };

        parentRows.push(parentRow);
      }
    });

    return parentRows;
  }

  private getChildParent(child: DashboardRowChild, parentRows: DashboardRowParent[]): DashboardRowParent | undefined {
    return parentRows.find(parent => {
      return parent.id === child.parentId;
    });
  }

  private getParentChildren(parentId: string, childRows: DashboardRowChild[]): DashboardRowChild[] {
    return childRows.filter(child => {
      return child.parentId === parentId;
    });
  }

  private getRangeFrom<ValueType>(values: ValueType[]): ValueType[] {
    let minValue = values[0];
    let maxValue = values[0];
    values.forEach(value => {
      if (minValue > value) {
        minValue = value;
      }
      if (maxValue < value) {
        maxValue = value;
      }
    });

    return [minValue, maxValue];
  }

  private async getPresentValueInBackingTokensForPool(pool: TempusPool): Promise<number | undefined> {
    if (!this.tempusPoolService || !this.statisticsService) {
      console.error(
        'DashboardDataAdapter - getPresentValueInBackingTokensForPool() - Attempted to use DashboardDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    if (!this.userWalletAddress) {
      return undefined;
    }

    try {
      const [yieldTokenAddress, principalTokenAddress, pricePerPrincipalShare, pricePerYieldShare] = await Promise.all([
        this.tempusPoolService.getYieldToken(pool.address),
        this.tempusPoolService.getPrincipalToken(pool.address),
        this.tempusPoolService.pricePerPrincipalShareStored(pool.address),
        this.tempusPoolService.pricePerYieldShareStored(pool.address),
      ]);

      const yieldToken = getERC20TokenService(yieldTokenAddress);
      const principalToken = getERC20TokenService(principalTokenAddress);

      const [userYieldSupply, userPrincipalSupply] = await Promise.all([
        yieldToken.balanceOf(this.userWalletAddress),
        principalToken.balanceOf(this.userWalletAddress),
      ]);

      const yieldValue = userYieldSupply.mul(pricePerYieldShare);
      const principalValue = userPrincipalSupply.mul(pricePerPrincipalShare);

      const totalValue = yieldValue.add(principalValue);

      return Number(ethers.utils.formatEther(totalValue));
    } catch (error) {
      console.error(
        `DashboardDataAdapter - getPresentValueInBackingTokensForPool() ` +
          `- Failed to get present value in backing tokens for user: "${this.userWalletAddress}", pool: "${pool.address}"`,
      );
      return Promise.reject(error);
    }
  }

  private async getAvailableToDepositForPool(pool: TempusPool): Promise<number | undefined> {
    if (!this.tempusPoolService || !this.statisticsService) {
      console.error(
        'DashboardDataAdapter - getAvailableToDepositForPool() - Attempted to use DashboardDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    if (!this.userWalletAddress) {
      return undefined;
    }

    try {
      const poolBackingToken = await this.tempusPoolService.getBackingToken(pool.address);
      const backingToken = getERC20TokenService(poolBackingToken);

      const availableToDeposit = await backingToken.balanceOf(this.userWalletAddress);

      return Number(ethers.utils.formatEther(availableToDeposit));
    } catch (error) {
      console.error(
        `DashboardDataAdapter - getAvailableToDepositForPool() - ` +
          `Failed to fetch Available to Deposit for user: ${this.userWalletAddress}, pool: ${pool.address}`,
      );
      return Promise.reject(error);
    }
  }
}
