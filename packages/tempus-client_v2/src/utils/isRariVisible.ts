import { DynamicPoolStateData } from '../state/PoolDataState';

export function isRariVisible(poolAddress: string, dynamicPoolData: DynamicPoolStateData) {
  const principals = dynamicPoolData[poolAddress].userPrincipalsBalance;
  const yields = dynamicPoolData[poolAddress].userYieldsBalance;
  if ((principals && !principals.isZero()) || (yields && !yields.isZero())) {
    return true;
  } else {
    return false;
  }
}
