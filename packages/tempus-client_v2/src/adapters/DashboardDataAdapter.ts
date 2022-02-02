import { BigNumber } from 'ethers';
import { filter, from, interval, Observable, of, startWith, switchMap, catchError } from 'rxjs';
import { DashboardRow, DashboardRowChild, DashboardRowParent } from '../interfaces/DashboardRow';
import { Ticker } from '../interfaces/Token';
import { TempusPool } from '../interfaces/TempusPool';
import StatisticsService from '../services/StatisticsService';
import { getChainConfig } from '../utils/getConfig';
import { POLLING_INTERVAL } from '../constants';
import { Chain } from '../interfaces/Chain';
import getRangeFrom from '../utils/getRangeFrom';

type DashboardDataAdapterParameters = {
  statisticsService: StatisticsService;
};

export default class DashboardDataAdapter {
  private statisticsService: StatisticsService | null = null;

  init(params: DashboardDataAdapterParameters) {
    this.statisticsService = params.statisticsService;
  }

  getRows(chainName: Chain): DashboardRow[] {
    let childRows = this.getChildRows(chainName);

    // Generates parent rows based on children rows
    const parentRows = this.getParentRows(childRows);

    return [...parentRows, ...childRows];
  }

  getTempusPoolTVL(
    chain: Chain,
    tempusPool: string,
    backingTokenTicker: Ticker,
    forceFetch?: boolean,
  ): Observable<BigNumber | null> {
    if (!this.statisticsService) {
      return of(null);
    }

    const interval$ = interval(POLLING_INTERVAL).pipe(startWith(0));
    return interval$.pipe(
      filter(() => {
        if (forceFetch) {
          return true;
        }
        return document.hasFocus();
      }),
      switchMap(() => {
        if (this.statisticsService) {
          return from(this.statisticsService.totalValueLockedUSD(chain, tempusPool, backingTokenTicker));
        }
        return of(null);
      }),
      catchError(error => {
        console.error('DashboardAdapter - getTempusPoolTVL', error);
        return of(null);
      }),
    );
  }

  private getChildRows(chainName: Chain): DashboardRowChild[] {
    const childRows: DashboardRowChild[] = [];
    getChainConfig(chainName).tempusPools.forEach(tempusPool => {
      childRows.push(this.getChildRowData(tempusPool, chainName));
    });
    return childRows;
  }

  private getChildRowData(tempusPool: TempusPool, chainName: Chain): DashboardRowChild {
    return {
      id: tempusPool.address,
      parentId: tempusPool.backingToken,
      token: tempusPool.backingToken,
      tempusPool: tempusPool,
      supportedTokens: [tempusPool.backingToken, tempusPool.yieldBearingToken],
      startDate: new Date(tempusPool.startDate),
      maturityDate: new Date(tempusPool.maturityDate),
      chain: chainName,
    };
  }

  private getParentRows(childRows: DashboardRowChild[]): DashboardRowParent[] {
    const parentRows: DashboardRowParent[] = [];

    childRows.forEach(child => {
      const childParent = this.getChildParent(child, parentRows);

      // Create child parent if it does not already exist.
      if (!childParent) {
        const parentChildren = this.getParentChildren(child.token, childRows);

        const childrenMaturityDate = parentChildren.map(child => child.maturityDate);
        const childrenProtocols = parentChildren.map(child => child.tempusPool.protocol);

        const parentRow: DashboardRowParent = {
          id: child.token, // Using token as parent ID, this way multiple children with same token will fall under same parent.
          parentId: null, // Always null for parent rows
          token: child.token,
          maturityRange: getRangeFrom<Date>(childrenMaturityDate),
          protocols: Array.from(new Set(childrenProtocols)), // Converting list of protocols to set removes duplicate items
          chain: child.chain,
        };

        parentRows.push(parentRow);
      }
    });

    return parentRows;
  }

  private getChildParent(child: DashboardRowChild, parentRows: DashboardRowParent[]): DashboardRowParent | undefined {
    return parentRows.find(parent => parent.id === child.parentId);
  }

  private getParentChildren(parentId: string, childRows: DashboardRowChild[]): DashboardRowChild[] {
    return childRows.filter(child => child.parentId === parentId);
  }
}
