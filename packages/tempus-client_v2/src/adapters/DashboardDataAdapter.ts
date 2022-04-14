import { BigNumber } from 'ethers';
import { filter, from, interval, Observable, of, startWith, switchMap, catchError } from 'rxjs';
import {
  CONSTANTS,
  Chain,
  Ticker,
  TempusPool,
  ProtocolName,
  getRangeFrom,
  getStatisticsService,
} from 'tempus-core-services';
import { DashboardRow, DashboardRowChild, DashboardRowParent } from '../interfaces/DashboardRow';
import { getChainConfig, getConfig } from '../utils/getConfig';

const { POLLING_INTERVAL } = CONSTANTS;

export type RowsExcludedByDefault = {
  [key in ProtocolName]?: {
    [poolAddress: string]: true; // whitelist
  };
};

export default class DashboardDataAdapter {
  getRows(chain?: Chain, rowsExcludedByDefault?: RowsExcludedByDefault): DashboardRow[] {
    const childRows: DashboardRowChild[] = [];

    const configData = getConfig();
    for (const chainName in configData) {
      // If specific chain is selected, we should skip adding pools from other chains
      if (chain && chain !== chainName) {
        continue;
      }

      childRows.push(...this.filterRowsByExclusionList(this.getChildRows(chainName as Chain), rowsExcludedByDefault));
    }

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
    const statisticsService = getStatisticsService(chain, getConfig, getChainConfig);

    const interval$ = interval(POLLING_INTERVAL).pipe(startWith(0));
    return interval$.pipe(
      filter(() => {
        if (forceFetch) {
          return true;
        }
        return document.hasFocus();
      }),
      switchMap(() => {
        return from(statisticsService.totalValueLockedUSD(chain, tempusPool, backingTokenTicker));
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
      parentId: `${tempusPool.backingToken}-${chainName}`,
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
        const parentChildren = this.getParentChildren(child.parentId, childRows);

        const childrenMaturityDate = parentChildren.map(child => child.maturityDate);
        const childrenProtocols = parentChildren.map(child => child.tempusPool.protocol);

        const parentRow: DashboardRowParent = {
          id: `${child.token}-${child.chain}`, // Using token+chain as parent ID, this way multiple children with same token and chain will fall under same parent.
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

  private filterRowsByExclusionList = (
    childRows: DashboardRowChild[],
    rowsExcludedByDefault?: RowsExcludedByDefault,
  ): DashboardRowChild[] => {
    if (!rowsExcludedByDefault) {
      return childRows;
    }

    return childRows.filter(row => {
      const { tempusPool } = row;
      const { address, protocol } = tempusPool as TempusPool;

      // if the protocol needs to be excluded
      if (rowsExcludedByDefault[protocol]) {
        const whitelistedRows = rowsExcludedByDefault[protocol];
        // then check if the pool is whitelisted
        if (whitelistedRows) {
          return !!whitelistedRows[address];
        }
        // otherwise filter it out
        return false;
      }
      // otherwise keep the pool
      return true;
    });
  };
}
