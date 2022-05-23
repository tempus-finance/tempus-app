import { BigNumber } from 'ethers';
import { TempusPool } from './TempusPool';

export interface AvailableToDeposit {
  backingTokenValueInFiat: BigNumber | null;
  backingTokensAvailable: BigNumber | null;
  yieldBearingTokenValueInFiat: BigNumber | null;
  yieldBearingTokenValueInBackingToken: BigNumber | null;
}

export interface DynamicTempusPool extends AvailableToDeposit, TempusPool {
  poolShareBalance: {
    principals: BigNumber | null;
    yields: BigNumber | null;
  };
  userBalanceUSD: BigNumber | null;
  userPrincipalsBalance: BigNumber | null;
  userYieldsBalance: BigNumber | null;
  userLPTokenBalance: BigNumber | null;
  userBackingTokenBalance: BigNumber | null;
  userBalanceInBackingToken: BigNumber | null;
  userYieldBearingTokenBalance: BigNumber | null;
  tvl: BigNumber | null;
  variableAPR: number | null;
  tempusFees: number | null;
  fixedAPR: number | null | 'fetching';
  negativeYield: boolean;
  isMatured?: boolean;
  isInactive?: boolean;
}
