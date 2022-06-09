import { ContractTransaction } from 'ethers';
import { from, map, mergeMap, Observable } from 'rxjs';
import { INFINITE_DEADLINE } from '../constants';
import { StatsV2Contract } from '../contracts/StatsV2Contract';
import { TempusAMMV1Contract } from '../contracts/TempusAMMV1Contract';
import { TempusControllerV1Contract } from '../contracts/TempusControllerV1Contract';
import { Decimal, DEFAULT_DECIMAL_PRECISION } from '../datastructures';
import { Chain, Ticker } from '../interfaces';
import { BaseService, ConfigGetter } from './BaseService';

export class WithdrawService extends BaseService {
  private chain: Chain;

  constructor(chain: Chain, getConfig: ConfigGetter) {
    super(getConfig);

    this.chain = chain;
  }

  withdraw(
    poolAddress: string,
    amountToGet: Decimal,
    tokenToGet: Ticker,
    slippage: Decimal,
  ): Observable<ContractTransaction> {
    // In order to avoid unused parameter lint error
    console.log(amountToGet.toString());

    const statsContractAddress = this.getStatsAddressForPool(poolAddress);
    const tempusControllerContractAddress = this.getTempusControllerAddressForPool(poolAddress);
    const ammContractAddress = this.getAmmAddressForPool(poolAddress);

    const poolConfig = this.getPoolConfig(poolAddress);

    const {
      tokenPrecision: { backingToken, yieldBearingToken, principals, yields, lpTokens },
    } = poolConfig;

    // TODO - Calculate following amounts using amountToGet+tokenToGet params that user entered in withdraw modal
    const lpAmount = new Decimal(0.01);
    const capitalsAmount = new Decimal(0.01);
    const yieldsAmount = new Decimal(0.01);

    const tempusControllerContract = new TempusControllerV1Contract(this.chain, tempusControllerContractAddress);
    const statsContract = new StatsV2Contract(this.chain, statsContractAddress);

    const maxLeftoverShares = capitalsAmount.add(yieldsAmount).add(lpAmount).div(new Decimal(1000));

    const toBackingToken = tokenToGet === poolConfig.backingToken;

    return from(
      statsContract.estimateExitAndRedeem(
        ammContractAddress,
        capitalsAmount,
        yieldsAmount,
        lpAmount,
        backingToken,
        yieldBearingToken,
        principals,
        yields,
        lpTokens,
        maxLeftoverShares,
        toBackingToken,
      ),
    ).pipe(
      mergeMap(estimate => {
        const minCapitalsStaked = estimate.principalsStaked.sub(estimate.principalsStaked.mul(slippage));
        const minYieldsStaked = estimate.yieldsStaked.sub(estimate.yieldsStaked.mul(slippage));

        const totalCapitals = capitalsAmount.add(estimate.principalsStaked);
        const totalYields = yieldsAmount.add(estimate.yieldsStaked);

        const tempusAMM = new TempusAMMV1Contract(this.chain, ammContractAddress);

        let yieldsRate$: Observable<Decimal>;
        // Calculate yieldsRate if pool is not mature yet
        if (poolConfig.maturityDate > Date.now()) {
          if (totalYields.gt(totalCapitals)) {
            const tokenSwapAmount = totalYields.sub(totalCapitals);

            yieldsRate$ = tempusAMM
              .getExpectedReturnGivenIn(tokenSwapAmount, true, principals, yields)
              .pipe(map(estimatedPrincipals => estimatedPrincipals.div(tokenSwapAmount)));
          } else if (totalCapitals.gt(totalYields)) {
            const tokenSwapAmount = totalCapitals.sub(totalYields);

            yieldsRate$ = tempusAMM
              .getExpectedReturnGivenIn(tokenSwapAmount, false, principals, yields)
              .pipe(map(estimatedYields => tokenSwapAmount.div(estimatedYields)));
          } else {
            // In case we have equal amounts, use 1 as swapAmount just in case estimate was wrong,
            // and swap is going to happen anyways
            const tokenSwapAmount = new Decimal(1);

            yieldsRate$ = tempusAMM
              .getExpectedReturnGivenIn(tokenSwapAmount, true, principals, yields)
              .pipe(map(estimatedPrincipals => estimatedPrincipals.div(tokenSwapAmount)));
          }
        } else {
          // In case pool is mature, withdraw will not execute any swaps under the hood,
          // so we can set yieldsRate to any value other then zero

          yieldsRate$ = new Observable().pipe(map(() => new Decimal(1)));
        }

        const maxSlippage = slippage.div(100);

        const deadline = new Decimal(INFINITE_DEADLINE, DEFAULT_DECIMAL_PRECISION);

        return yieldsRate$.pipe(
          mergeMap(yieldsRate =>
            tempusControllerContract.exitAmmGiveLpAndRedeem(
              ammContractAddress,
              lpAmount,
              capitalsAmount,
              yieldsAmount,
              minCapitalsStaked,
              minYieldsStaked,
              maxLeftoverShares,
              yieldsRate,
              maxSlippage,
              toBackingToken,
              deadline,
            ),
          ),
        );
      }),
    );
  }
}
