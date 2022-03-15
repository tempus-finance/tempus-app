import { BigNumber } from 'ethers';
import { CONSTANTS } from 'tempus-core-services';

const { ONE_DAI_IN_WAD, ONE_DAI_IN_RAY } = CONSTANTS;

export const wadToDai = (ray: BigNumber): BigNumber => ray.div(ONE_DAI_IN_WAD);

export const rayToDai = (ray: BigNumber): BigNumber => ray.div(ONE_DAI_IN_RAY);
