import Words from '../localisation/words';
import { getConfigForPoolWithAddress } from '../utils/getConfig';
import { dynamicPoolDataState } from '../state/PoolDataState';

export default class SidebarDataAdapter {
  getDepositDisabledReason(poolAddress: string): Words | null {
    const { disabledOperations, maturityDate } = getConfigForPoolWithAddress(poolAddress);
    const { deposit } = disabledOperations;

    if (deposit) {
      return 'depositDisabledByConfig';
    }

    if (maturityDate <= Date.now()) {
      return 'depositDisabledPoolMaturity';
    }

    const poolShareBalance = dynamicPoolDataState[poolAddress].poolShareBalance.get();
    const negativeYield = dynamicPoolDataState[poolAddress].negativeYield.get();
    if (
      !poolShareBalance.principals ||
      !poolShareBalance.yields ||
      (poolShareBalance.principals.isZero() && poolShareBalance.yields.isZero())
    ) {
      return 'depositDisabledNoLiquidity';
    }

    if (negativeYield) {
      return 'depositDisabledNegative';
    }

    return null;
  }

  getWithdrawDisabledReason(poolAddress: string): Words | null {
    const poolShareBalance = dynamicPoolDataState[poolAddress].poolShareBalance.get();
    const negativeYield = dynamicPoolDataState[poolAddress].negativeYield.get();

    if (
      !poolShareBalance.principals ||
      !poolShareBalance.yields ||
      (poolShareBalance.principals.isZero() && poolShareBalance.yields.isZero())
    ) {
      return 'withdrawDisabledNoLiquidity';
    }

    if (negativeYield) {
      return 'withdrawDisabledNegative';
    }

    const userPrincipalsBalance = dynamicPoolDataState[poolAddress].userPrincipalsBalance.get();
    const userYieldsBalance = dynamicPoolDataState[poolAddress].userYieldsBalance.get();
    const userLPTokenBalance = dynamicPoolDataState[poolAddress].userLPTokenBalance.get();

    if (
      !userPrincipalsBalance ||
      !userYieldsBalance ||
      !userLPTokenBalance ||
      (userPrincipalsBalance.isZero() && userYieldsBalance.isZero() && userLPTokenBalance.isZero())
    ) {
      return 'withdrawDisabledNoDeposit';
    }

    return null;
  }

  getMintDisabledReason(poolAddress: string): Words | null {
    const { disabledOperations, maturityDate } = getConfigForPoolWithAddress(poolAddress);
    const { mint } = disabledOperations;

    if (mint) {
      return 'mintingDisabledByConfig';
    }

    if (maturityDate <= Date.now()) {
      return 'mintDisabledPoolMaturity';
    }
    return null;
  }

  getSwapDisabledReason(poolAddress: string): Words | null {
    const { maturityDate } = getConfigForPoolWithAddress(poolAddress);

    if (maturityDate <= Date.now()) {
      return 'swapDisabledPoolMaturity';
    }

    const poolShareBalance = dynamicPoolDataState[poolAddress].poolShareBalance.get();

    if (
      !poolShareBalance.principals ||
      !poolShareBalance.yields ||
      (poolShareBalance.principals.isZero() && poolShareBalance.yields.isZero())
    ) {
      return 'swapDisabledNoLiquidity';
    }

    const userPrincipalsBalance = dynamicPoolDataState[poolAddress].userPrincipalsBalance.get();
    const userYieldsBalance = dynamicPoolDataState[poolAddress].userYieldsBalance.get();

    if (
      !userPrincipalsBalance ||
      !userYieldsBalance ||
      (userPrincipalsBalance.isZero() && userYieldsBalance.isZero())
    ) {
      return 'swapDisabledNoShares';
    }

    return null;
  }

  getProvideLiquidityDisabledReason(poolAddress: string): Words | null {
    const { maturityDate } = getConfigForPoolWithAddress(poolAddress);

    if (maturityDate <= Date.now()) {
      return 'provideLiquidityDisabledPoolMaturity';
    }

    const userPrincipalsBalance = dynamicPoolDataState[poolAddress].userPrincipalsBalance.get();
    const userYieldsBalance = dynamicPoolDataState[poolAddress].userYieldsBalance.get();

    if (
      !userPrincipalsBalance ||
      !userYieldsBalance ||
      (userPrincipalsBalance.isZero() && userYieldsBalance.isZero())
    ) {
      return 'provideLiquidityDisabledNoDeposit';
    }

    if (!userPrincipalsBalance || userPrincipalsBalance.isZero()) {
      return 'provideLiquidityDisabledNoPrincipals';
    }

    if (!userYieldsBalance || userYieldsBalance.isZero()) {
      return 'provideLiquidityDisabledNoYields';
    }

    return null;
  }

  getRemoveLiquidityDisabledReason(poolAddress: string): Words | null {
    const { maturityDate } = getConfigForPoolWithAddress(poolAddress);

    if (maturityDate <= Date.now()) {
      return 'removeLiquidityDisabledPoolMaturity';
    }

    const userPrincipalsBalance = dynamicPoolDataState[poolAddress].userPrincipalsBalance.get();
    const userYieldsBalance = dynamicPoolDataState[poolAddress].userYieldsBalance.get();
    const userLPTokenBalance = dynamicPoolDataState[poolAddress].userLPTokenBalance.get();

    if (
      !userPrincipalsBalance ||
      !userYieldsBalance ||
      !userLPTokenBalance ||
      (userPrincipalsBalance.isZero() && userYieldsBalance.isZero() && userLPTokenBalance.isZero())
    ) {
      return 'removeLiquidityDisabledNoDeposit';
    }

    if (!userLPTokenBalance || userLPTokenBalance.isZero()) {
      return 'removeLiquidityDisabledNoLpTokens';
    }

    return null;
  }
}
