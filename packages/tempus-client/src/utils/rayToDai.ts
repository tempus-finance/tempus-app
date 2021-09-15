import { BigNumber } from 'ethers';
import { ONE_DAI_IN_WAD, ONE_DAI_IN_RAY } from '../constants';

export const wadToDai = (ray: BigNumber): BigNumber => ray.div(ONE_DAI_IN_WAD);

export const rayToDai = (ray: BigNumber): BigNumber => ray.div(ONE_DAI_IN_RAY);
