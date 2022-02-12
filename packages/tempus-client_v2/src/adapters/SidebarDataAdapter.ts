import Words from '../localisation/words';
import { getConfigForPoolWithAddress } from '../utils/getConfig';
import { dynamicPoolDataState } from '../state/PoolDataState';
import { BigNumber } from 'ethers';

export default class SidebarDataAdapter {
  getDepositDisabledReason(
    poolAddress: string,
    poolShareBalance: {
      principals: BigNumber | null;
      yields: BigNumber | null;
    },
    negativeYield: boolean,
  ): Words | null {
    const { disabledOperations, maturityDate } = getConfigForPoolWithAddress(poolAddress);
    const { deposit } = disabledOperations;

    if (deposit) {
      return 'depositDisabledByConfig';
    }

    if (maturityDate <= Date.now()) {
      return 'depositDisabledPoolMaturity';
    }

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

  getWithdrawDisabledReason(
    poolShareBalance: {
      principals: BigNumber | null;
      yields: BigNumber | null;
    },
    negativeYield: boolean,
    userPrincipalsBalance: BigNumber | null,
    userYieldsBalance: BigNumber | null,
    userLPTokenBalance: BigNumber | null,
  ): Words | null {
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
      return 'mintDisabledByConfig';
    }

    if (maturityDate <= Date.now()) {
      return 'mintDisabledPoolMaturity';
    }
    return null;
  }

  getSwapDisabledReason(
    poolAddress: string,
    poolShareBalance: {
      principals: BigNumber | null;
      yields: BigNumber | null;
    },
    userPrincipalsBalance: BigNumber | null,
    userYieldsBalance: BigNumber | null,
  ): Words | null {
    const { maturityDate } = getConfigForPoolWithAddress(poolAddress);

    if (maturityDate <= Date.now()) {
      return 'swapDisabledPoolMaturity';
    }

    if (
      !poolShareBalance.principals ||
      !poolShareBalance.yields ||
      (poolShareBalance.principals.isZero() && poolShareBalance.yields.isZero())
    ) {
      return 'swapDisabledNoLiquidity';
    }

    if (
      !userPrincipalsBalance ||
      !userYieldsBalance ||
      (userPrincipalsBalance.isZero() && userYieldsBalance.isZero())
    ) {
      return 'swapDisabledNoShares';
    }

    return null;
  }

  getProvideLiquidityDisabledReason(
    poolAddress: string,
    userPrincipalsBalance: BigNumber | null,
    userYieldsBalance: BigNumber | null,
  ): Words | null {
    const { maturityDate } = getConfigForPoolWithAddress(poolAddress);

    if (maturityDate <= Date.now()) {
      return 'provideLiquidityDisabledPoolMaturity';
    }

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

  getRemoveLiquidityDisabledReason(
    poolAddress: string,
    userPrincipalsBalance: BigNumber | null,
    userYieldsBalance: BigNumber | null,
    userLPTokenBalance: BigNumber | null,
  ): Words | null {
    const { maturityDate } = getConfigForPoolWithAddress(poolAddress);

    if (maturityDate <= Date.now()) {
      return 'removeLiquidityDisabledPoolMaturity';
    }

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
