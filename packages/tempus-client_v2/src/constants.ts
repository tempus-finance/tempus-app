import { BigNumber } from '@ethersproject/bignumber';

export const MILLISECONDS_IN_A_YEAR = 31536000000;
export const DAYS_IN_A_YEAR = 365;
export const SECONDS_IN_AN_HOUR = 3600;
export const SECONDS_IN_A_DAY = SECONDS_IN_AN_HOUR * 24;
export const SECONDS_IN_YEAR = SECONDS_IN_A_DAY * 365;
export const ZERO = BigNumber.from('0');
export const ZERO_ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ONE_ETH_IN_WEI = '1000000000000000000'; // 10^18
export const ONE_DAI_IN_WAD = '1000000000'; // 10^9
export const ONE_DAI_IN_RAY = '1000000000000000000000000000'; // 10^27
export const INFINITE_DEADLINE = BigNumber.from('8640000000000000');
export const ETH_ALLOWANCE_FOR_GAS = BigNumber.from('50000000000000000'); // 0.05 ETH

export const DEFAULT_TOKEN_PRECISION = 18;
export const SLIPPAGE_PRECISION = 18;
export const FIXED_APR_PRECISION = 18;

export const aaveLendingPoolAddress = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
export const daiAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
export const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';

export const COMPOUND_BLOCKS_PER_DAY = 6570; // 13.15 seconds per block

export const approveGasIncrease = 1.05;
export const depositAndFixGasIncrease = 1.05;
export const depositAndProvideLiquidityGasIncrease = 1.05;
export const completeExitAndRedeemGasIncrease = 1.05;
export const depositYieldBearingGasIncrease = 1.05;
export const depositBackingGasIncrease = 1.05;
export const provideLiquidityGasIncrease = 1.05;
export const removeLiquidityGasIncrease = 1.05;

export const dashboardParentMaturityFormat = 'MMM yyyy';
export const dashboardChildMaturityFormat = 'd MMMM yyyy';

export const POLLING_INTERVAL = 30 * 1000;

export const tokenPrecision: { [ticker: string]: number } = {
  ETH: 18,
  USDC: 6,
  DAI: 18,
};

const ALCHEMY_KEY = process.env.REACT_APP_MAINNET_ALCHEMY_KEY;
const GOERLI_ALCHEMY_KEY = process.env.REACT_APP_GOERLI_ALCHEMY_KEY;
const FANTOM_ENDPOINT = process.env.REACT_APP_FANTOM_ENDPOINT;

export enum SupportedChainId {
  MAINNET = 1,
  FANTOM = 250,
  LOCAL = 1337,
  TEMPUS_AWS = 31337,
}

export const supportedChainIds = [
  SupportedChainId.MAINNET,
  SupportedChainId.LOCAL,
  SupportedChainId.TEMPUS_AWS,
  SupportedChainId.FANTOM,
];

export const NETWORK_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  [SupportedChainId.LOCAL]: `https://eth-goerli.alchemyapi.io/v2/${GOERLI_ALCHEMY_KEY}`,
  [SupportedChainId.TEMPUS_AWS]: `https://eth-goerli.alchemyapi.io/v2/${GOERLI_ALCHEMY_KEY}`,
  [SupportedChainId.FANTOM]: FANTOM_ENDPOINT || '',
};
