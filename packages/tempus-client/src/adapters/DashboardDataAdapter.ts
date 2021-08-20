import { ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { DashboardRow, DashboardRowChild, DashboardRowParent } from '../interfaces';
import { TempusPool } from '../interfaces/TempusPool';
import getStatisticsService from '../services/getStatisticsService';
import getTempusPoolService from '../services/getTempusPoolService';
import StatisticsService from '../services/StatisticsService';
import TempusPoolService from '../services/TempusPoolService';
import getConfig from '../utils/get-config';

type DashboardDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
};

export default class DashboardDataAdapter {
  private tempusPoolService: TempusPoolService | null = null;
  private statisticsService: StatisticsService | null = null;

  public init(params: DashboardDataAdapterParameters) {
    this.tempusPoolService = getTempusPoolService(params.signerOrProvider);
    this.statisticsService = getStatisticsService(params.signerOrProvider);
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
      const [backingTokenTicker, yieldBearingTokenTicker, protocolName, startDate, maturityDate] = await Promise.all([
        this.tempusPoolService.getBackingTokenTicker(tempusPool.address),
        this.tempusPoolService.getYieldBearingTokenTicker(tempusPool.address),
        this.tempusPoolService.getProtocolName(tempusPool.address),
        this.tempusPoolService.getStartTime(tempusPool.address),
        this.tempusPoolService.getMaturityTime(tempusPool.address),
      ]);

      const tvl = await this.statisticsService.totalValueLockedUSD(tempusPool.address, backingTokenTicker);

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
        presentValue: 1000.0, // TODO - Need to decide what to do with this column before user connects the wallet.
        availableToDeposit: '12.334 DAI', // TODO - Needs to decide what to do with this column before user connects the wallet.
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
          return accumulator + currentValue.presentValue;
        }, 0);

        const parentRow: DashboardRowParent = {
          id: child.token, // Using token as parent ID, this way multiple children with same token will fall under same parent.
          parentId: null, // Always null for parent rows
          token: child.token,
          maturity: this.getRangeFrom<Date>(childrenMaturityDate),
          fixedAPY: this.getRangeFrom<number>(childrenFixedAPY),
          variableAPY: this.getRangeFrom<number>(childrenVariable),
          TVL: parentTVL,
          presentValue: parentPresentValue,
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
}
