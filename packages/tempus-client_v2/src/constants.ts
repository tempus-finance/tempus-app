import { BigNumber } from '@ethersproject/bignumber';

export const DAYS_IN_A_YEAR = 365;
export const SECONDS_IN_AN_HOUR = 3600;
export const SECONDS_IN_A_DAY = SECONDS_IN_AN_HOUR * 24;
export const SECONDS_IN_YEAR = SECONDS_IN_A_DAY * 365;
export const BLOCK_DURATION_SECONDS = 13.15;
export const ZERO = BigNumber.from('0');
export const ZERO_ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ONE_ETH_IN_WEI = '1000000000000000000'; // 10^18
export const ONE_DAI_IN_WAD = '1000000000'; // 10^9
export const ONE_DAI_IN_RAY = '1000000000000000000000000000'; // 10^27
export const INFINITE_DEADLINE = BigNumber.from('8640000000000000');

export const DEFAULT_TOKEN_PRECISION = 18;

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

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;

export enum SupportedChainId {
  // MAINNET = 1,
  // ROPSTEN = 3,
  // RINKEBY = 4,
  GOERLI = 5,
  // KOVAN = 42,

  // ARBITRUM_ONE = 42161,
  // ARBITRUM_RINKEBY = 421611,
  // OPTIMISM = 10,
  // OPTIMISTIC_KOVAN = 69,
  LOCAL = 1337,
  TEMPUS_AWS = 31337,
}

export const supportedChainIds = [SupportedChainId.GOERLI, SupportedChainId.LOCAL, SupportedChainId.TEMPUS_AWS];

export const NETWORK_URLS: { [key in SupportedChainId]: string } = {
  // [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.GOERLI]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.KOVAN]: `https://kovan.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.OPTIMISM]: `https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.OPTIMISTIC_KOVAN]: `https://optimism-kovan.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.ARBITRUM_ONE]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`,
  // [SupportedChainId.ARBITRUM_RINKEBY]: `https://arbitrum-rinkeby.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.LOCAL]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.TEMPUS_AWS]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
};
