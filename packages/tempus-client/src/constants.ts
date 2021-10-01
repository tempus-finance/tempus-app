export const DAYS_IN_A_YEAR = 365;
export const SECONDS_IN_AN_HOUR = 3600;
export const SECONDS_IN_A_DAY = SECONDS_IN_AN_HOUR * 24;
export const SECONDS_IN_YEAR = SECONDS_IN_A_DAY * 365;
export const BLOCK_DURATION_SECONDS = 13.15;
export const ZERO_ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ONE_ETH_IN_WEI = '1000000000000000000'; // 10^18
export const ONE_DAI_IN_WAD = '1000000000'; // 10^9
export const ONE_DAI_IN_RAY = '1000000000000000000000000000'; // 10^27

export const lidoOracleAddress = '0x442af784a788a5bd6f42a01ebe9f287a871243fb';
export const aaveLendingPoolAddress = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
export const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
export const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';

export const COMPOUND_BLOCKS_PER_DAY = 6570; // 13.15 seconds per block

export const variableAPYTooltipText =
  'Calculated as the sum of the current estimated yield in the underlying Protocol and the current estimated yield from the AMM (swap fees received by providing maximum liquidity to the TYS/TPS pool).';

export const fixedAPRTooltipText =
  'Calculated based on the current TYS/TPS exchange rate and does not take into account slippage. For a more accurate calculation, please click on the "Open" icon for the relevant pool and use the deposit function.';

export const volume24hTooltipText = 'Calculated as the sum of deposit, redeem, and swap amounts in a 24 hour period.';

export const interestRateProtectionTooltipText =
  'Fix your future yield with Tempus. This function locks your Yield Bearing Token, mints Principals and Yields in exchange, and swaps all Yields for Principals through TempusAMM. You will receive Principals which will be redeemable 1:1 to the Underlying asset on Maturity.';

export const liquidityProvisionTooltipText =
  'Provide liquidity to Tempus to earn extra yield. This function locks your Yield Bearing Token, mints Principals and Yields in exchange, and uses the maximum available number of Principals and Yields to provide liquidity to TempusAMM. This means that you will receive the underlying yield, and the Tempus swap fees, aggregated into one yield.';
