import { ethers, BigNumber } from 'ethers';
import { from, interval, Observable, of, startWith, switchMap } from 'rxjs';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import {
  AvailableToDeposit,
  DashboardRow,
  DashboardRowChild,
  DashboardRowParent,
  ProtocolName,
  Ticker,
} from '../interfaces';
import { TempusPool } from '../interfaces/TempusPool';
import StatisticsService from '../services/StatisticsService';
import TempusPoolService from '../services/TempusPoolService';
import getERC20TokenService from '../services/getERC20TokenService';
import getConfig from '../utils/get-config';
import { mul18f } from '../utils/wei-math';
import { POLLING_INTERVAL } from '../constants';

type DashboardDataAdapterParameters = {
  signerOrProvider: JsonRpcProvider | JsonRpcSigner;
  tempusPoolService: TempusPoolService;
  statisticsService: StatisticsService;
  eRC20TokenServiceGetter: typeof getERC20TokenService;
};

export default class DashboardDataAdapter {
  private eRC20TokenServiceGetter: typeof getERC20TokenService | null = null;
  private tempusPoolService: TempusPoolService | null = null;
  private statisticsService: StatisticsService | null = null;
  private userWalletAddress: string = '';

  public init(params: DashboardDataAdapterParameters) {
    this.eRC20TokenServiceGetter = params.eRC20TokenServiceGetter;
    this.tempusPoolService = params.tempusPoolService;
    this.statisticsService = params.statisticsService;
  }

  public async getRows(userWalletAddress: string): Promise<DashboardRow[]> {
    this.userWalletAddress = userWalletAddress;

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

  getTempusPoolTVL(tempusPool: string, backingTokenTicker: Ticker): Observable<BigNumber | null> {
    if (!this.statisticsService) {
      return of(null);
    }

    const interval$ = interval(POLLING_INTERVAL).pipe(startWith(0));
    return interval$.pipe(
      switchMap(() => {
        if (this.statisticsService) {
          return from(this.statisticsService.totalValueLockedUSD(tempusPool, backingTokenTicker));
        }
        return of(null);
      }),
    );
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
      const [poolBackingTokenRate, presentValueInBackingTokens, availableToDeposit] = await Promise.all([
        this.statisticsService.getRate(tempusPool.backingToken),
        this.getPresentValueInBackingTokensForPool(tempusPool),
        this.getAvailableToDepositForPool(tempusPool),
      ]);

      const availableToDepositInUSD = await this.getAvailableToDepositInUSD(
        tempusPool.address,
        availableToDeposit,
        poolBackingTokenRate,
      );

      return {
        id: tempusPool.address,
        tempusPool: tempusPool,
        parentId: tempusPool.backingToken,
        token: tempusPool.backingToken,
        supportedTokens: [tempusPool.backingToken, tempusPool.yieldBearingToken],
        protocol: tempusPool.protocol,
        principalTokenAddress: tempusPool.principalsAddress,
        yieldTokenAddress: tempusPool.yieldsAddress,
        backingTokenAddress: tempusPool.backingTokenAddress,
        yieldBearingTokenAddress: tempusPool.yieldBearingTokenAddress,
        yieldBearingTokenTicker: tempusPool.yieldBearingToken,
        startDate: new Date(tempusPool.startDate),
        maturityDate: new Date(tempusPool.maturityDate),
        presentValue:
          presentValueInBackingTokens !== undefined
            ? mul18f(presentValueInBackingTokens, poolBackingTokenRate)
            : undefined,
        availableTokensToDeposit: availableToDeposit && {
          backingToken: availableToDeposit.backingToken,
          backingTokenTicker: tempusPool.backingToken,
          yieldBearingToken: availableToDeposit.yieldBearingToken,
          yieldBearingTokenTicker: tempusPool.yieldBearingToken,
        },
        availableUSDToDeposit: availableToDepositInUSD,
        backingTokenTicker: tempusPool.backingToken,
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
        const childrenProtocols = parentChildren.map(child => child.protocol as ProtocolName);

        let parentPresentValue = BigNumber.from('0');
        parentChildren.forEach(child => {
          if (child.presentValue) {
            parentPresentValue = parentPresentValue.add(child.presentValue);
          }
        });

        const processedTokens: Ticker[] = [];
        let availableToDepositInUSD = BigNumber.from('0');
        parentChildren.forEach(child => {
          if (child.availableUSDToDeposit) {
            if (processedTokens.indexOf(child.availableUSDToDeposit.backingTokenTicker) === -1) {
              availableToDepositInUSD = availableToDepositInUSD.add(child.availableUSDToDeposit.backingToken);
              processedTokens.push(child.availableUSDToDeposit.backingTokenTicker);
            }
            if (processedTokens.indexOf(child.availableUSDToDeposit.yieldBearingTokenTicker) === -1) {
              availableToDepositInUSD = availableToDepositInUSD.add(child.availableUSDToDeposit.yieldBearingToken);
              processedTokens.push(child.availableUSDToDeposit.yieldBearingTokenTicker);
            }
          }
        });

        const parentRow: DashboardRowParent = {
          id: child.token, // Using token as parent ID, this way multiple children with same token will fall under same parent.
          parentId: null, // Always null for parent rows
          token: child.token,
          maturityRange: this.getRangeFrom<Date>(childrenMaturityDate),
          presentValue: this.userWalletAddress ? parentPresentValue : undefined,
          availableUSDToDeposit: this.userWalletAddress ? availableToDepositInUSD : undefined,
          protocols: Array.from(new Set(childrenProtocols)), // Converting list of protocols to set removes duplicate items
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

  private getRangeFrom<ValueType>(values: (ValueType | null)[]): (ValueType | null)[] {
    let minValue = values[0];
    let maxValue = values[0];
    values.forEach(value => {
      if (!value) {
        return;
      }
      if (minValue && minValue > value) {
        minValue = value;
      }
      if (maxValue && maxValue < value) {
        maxValue = value;
      }
    });

    return [minValue, maxValue];
  }

  private async getPresentValueInBackingTokensForPool(pool: TempusPool): Promise<BigNumber | undefined> {
    if (!this.statisticsService || !this.tempusPoolService || !this.eRC20TokenServiceGetter) {
      console.error(
        'DashboardDataAdapter - getPresentValueInForPool() - Attempted to use DashboardDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    if (!this.userWalletAddress) {
      return undefined;
    }

    const yieldToken = this.eRC20TokenServiceGetter(pool.yieldsAddress);
    const principalToken = this.eRC20TokenServiceGetter(pool.principalsAddress);
    const lpToken = this.eRC20TokenServiceGetter(pool.ammAddress);

    try {
      const [userYieldSupply, userPrincipalSupply, userLpSupply] = await Promise.all([
        yieldToken.balanceOf(this.userWalletAddress),
        principalToken.balanceOf(this.userWalletAddress),
        lpToken.balanceOf(this.userWalletAddress),
      ]);

      return await this.statisticsService.estimateExitAndRedeem(
        pool.ammAddress,
        userLpSupply,
        userPrincipalSupply,
        userYieldSupply,
        true,
      );
    } catch (error) {
      console.log('DashboardDataAdapter - getPresentValueInForPool() - Failed to user balance for pool!', error);
      return Promise.reject(error);
    }
  }

  private async getAvailableToDepositInUSD(
    poolAddress: string,
    data: AvailableToDeposit | undefined,
    conversionRate: BigNumber,
  ): Promise<AvailableToDeposit | undefined> {
    if (!this.tempusPoolService || !this.statisticsService || !this.eRC20TokenServiceGetter) {
      console.error(
        'DashboardDataAdapter - getPresentValueInBackingTokensForPool() - Attempted to use DashboardDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    if (!data || !this.userWalletAddress) {
      return undefined;
    }

    try {
      const interestRate = await this.tempusPoolService.currentInterestRate(poolAddress);
      const yieldBearingToBackingTokenRate = await this.tempusPoolService.numAssetsPerYieldToken(
        poolAddress,
        ethers.utils.parseEther('1'),
        interestRate,
      );

      const backingTokenUSDValue = mul18f(data.backingToken, conversionRate);
      const yieldBearingToBackingAmount = mul18f(data.yieldBearingToken, yieldBearingToBackingTokenRate);
      const yieldBearingTokenUSDValue = mul18f(yieldBearingToBackingAmount, conversionRate);

      return {
        backingToken: backingTokenUSDValue,
        backingTokenTicker: data.backingTokenTicker,
        yieldBearingToken: yieldBearingTokenUSDValue,
        yieldBearingTokenTicker: data.yieldBearingTokenTicker,
      };
    } catch (error) {
      console.error(
        `DashboardDataAdapter - getPresentValueInBackingTokensForPool() ` +
          `- Failed to get present value in backing tokens for user: "${this.userWalletAddress}", pool: "${poolAddress}"`,
      );
      return Promise.reject(error);
    }
  }

  private async getAvailableToDepositForPool(pool: TempusPool): Promise<AvailableToDeposit | undefined> {
    if (!this.tempusPoolService || !this.statisticsService || !this.eRC20TokenServiceGetter) {
      console.error(
        'DashboardDataAdapter - getAvailableToDepositForPool() - Attempted to use DashboardDataAdapter before initializing it!',
      );
      return Promise.reject();
    }

    if (!this.userWalletAddress) {
      return undefined;
    }

    try {
      const backingToken = this.eRC20TokenServiceGetter(pool.backingTokenAddress);
      const yieldBearingToken = this.eRC20TokenServiceGetter(pool.yieldBearingTokenAddress);

      const [backingTokensAvailable, yieldTokensAvailable] = await Promise.all([
        backingToken.balanceOf(this.userWalletAddress),
        yieldBearingToken.balanceOf(this.userWalletAddress),
      ]);

      return {
        backingToken: backingTokensAvailable,
        backingTokenTicker: pool.backingToken,
        yieldBearingToken: yieldTokensAvailable,
        yieldBearingTokenTicker: pool.yieldBearingToken,
      };
    } catch (error) {
      console.error(
        `DashboardDataAdapter - getAvailableToDepositForPool() - ` +
          `Failed to fetch Available to Deposit for user: ${this.userWalletAddress}, pool: ${pool.address}`,
      );
      return Promise.reject(error);
    }
  }
}
