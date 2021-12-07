import { BigNumber } from 'ethers';
import { filter, from, interval, Observable, of, startWith, switchMap, catchError } from 'rxjs';
import { DashboardRow, DashboardRowChild, DashboardRowParent } from '../interfaces/DashboardRow';
import { Ticker } from '../interfaces/Token';
import { TempusPool } from '../interfaces/TempusPool';
import StatisticsService from '../services/StatisticsService';
import getConfig from '../utils/getConfig';
import { POLLING_INTERVAL } from '../constants';

type DashboardDataAdapterParameters = {
  statisticsService: StatisticsService;
};

export default class DashboardDataAdapter {
  private statisticsService: StatisticsService | null = null;

  init(params: DashboardDataAdapterParameters) {
    this.statisticsService = params.statisticsService;
  }

  getRows(): DashboardRow[] {
    let childRows = this.getChildRows();

    // Generates parent rows based on children rows
    const parentRows = this.getParentRows(childRows);

    return [...parentRows, ...childRows];
  }

  getTempusPoolTVL(tempusPool: string, backingTokenTicker: Ticker, forceFetch?: boolean): Observable<BigNumber | null> {
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
          return from(this.statisticsService.totalValueLockedUSD(tempusPool, backingTokenTicker));
        }
        return of(null);
      }),
      catchError(error => {
        console.error('DashboardAdapter - getTempusPoolTVL', error);
        return of(null);
      }),
    );
  }

  private getChildRows(): DashboardRowChild[] {
    const childRows: DashboardRowChild[] = [];
    getConfig().tempusPools.forEach(tempusPool => {
      childRows.push(this.getChildRowData(tempusPool));
    });
    return childRows;
  }

  private getChildRowData(tempusPool: TempusPool): DashboardRowChild {
    return {
      id: tempusPool.address,
      parentId: tempusPool.backingToken,
      token: tempusPool.backingToken,
      tempusPool: tempusPool,
      supportedTokens: [tempusPool.backingToken, tempusPool.yieldBearingToken],
      startDate: new Date(tempusPool.startDate),
      maturityDate: new Date(tempusPool.maturityDate),
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
          maturityRange: this.getRangeFrom<Date>(childrenMaturityDate),
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
}
