import Words from './words';

const en: { [word in Words]: string } = {
  max: 'max',
  min: 'min',
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  community: 'Community',
  settings: 'Settings',
  connectWallet: 'Connect Wallet',
  pending: 'Pending...',
  selectWallet: ' Select Wallet',
  walletSelectorDisclaimer:
    'By connecting a wallet, you agree <a href="https://tempus.finance/terms-of-service" target="_blank">Tempus Terms of Service</a> and acknowledge that you have read and understand the <a href="https://tempus.finance/terms-of-service" target="_blank">Tempus Protocol Disclaimer</a>.',
  installMetamask: 'Install Metamask',
  availablePools: 'Available Pools',
  filter: 'Filter',
  asset: 'Asset',
  assetName: 'Asset Name',
  protocol: 'Protocol',
  protocolName: 'Protocol Name',
  clearFilter: 'Clear Filter',
  apply: 'Apply',
  token: 'token',
  fixedApr: 'Fixed APR',
  lifeTimeApr: 'Lifetime APR',
  apr: 'APR',
  aprRange: 'APR range',
  lpApr: 'LP APR',
  futureApr: 'Future APR',
  fiat: 'Fiat',
  crypto: 'Crypto',
  pool: 'Pool',
  ofPool: 'of the Pool',
  poolRatio: 'Pool Ratio (Principals / Yields)',
  redemption: 'Redemption',
  earlyRedemption: 'Early Redemption',
  swap: 'Swap',
  tvl: 'TVL',
  manage: 'Manage',
  basic: 'Basic',
  advanced: 'Advanced',
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  mint: 'Mint',
  removeLiquidity: 'Remove Liquidity',
  provideLiquidity: 'Provide Liquidity',
  earlyRedeem: 'Early Redeem',
  availableToDeposit: 'Available to Deposit',
  marketImpliedYield: 'Future APR ',
  volume: 'Volume',
  fees: 'Fees',
  term: 'Term',
  startDate: 'Start Date',
  maturity: 'Maturity',
  timeLeft: 'Time Remaining',
  currentPosition: 'Current Position',
  principals: 'Principals',
  yields: 'Yields',
  lpTokens: 'LP Tokens',
  staked: 'Staked',
  approve: 'Approve',
  approved: 'Approved',
  approving: 'Approving',
  execute: 'Execute',
  executing: 'Executing',
  profitLoss: 'Profit & Loss',
  liquidationValue: 'Liquidation Value',
  from: 'From',
  to: 'To',
  balance: 'Balance',
  futureYield: 'Future Yield',
  lifeTimeYield: 'Lifetime Yield',
  fixYourFutureYield: 'Fix Your Future Yield',
  fixedYield: 'Fixed Yield',
  fixedYieldAtMaturity: 'Fixed Yield At Maturity',
  totalAvailableAtMaturity: 'Total Available At Maturity',
  variableYield: 'Variable Yield',
  amountReceived: 'Amount Received',
  approx: 'Approx',
  estimatedAmountReceived: 'Estimated Amount Received',
  estimated: 'Estimated',
  feesTooltipInfo:
    'Deposit, Redemption, Early Redemption fees accrue to the Tempus Treasury. Swap fees accrue to liquidity providers.',
  selectPlaceholder: 'Please select',
  selectTokenFirst: 'Please select the token first',
  tempusAnnouncements: 'Tempus Announcements',
  tempusChat: 'TempusChat',
  interestRateProtectionTooltipText:
    'Fix your future yield with Tempus. This function locks your Yield Bearing Token, mints Principals and Yields in exchange, and swaps all Yields for Principals through TempusAMM.<br/><br/>You will receive Principals which will be redeemable 1:1 to the Underlying asset on Maturity.',
  liquidityProvisionTooltipText:
    'Provide liquidity to Tempus to earn extra yield. This function locks your Yield Bearing Token, mints Principals and Yields in exchange, and uses the maximum available number of Principals and Yields to provide liquidity to TempusAMM.<br/><br/>This means that you will receive the underlying yield, and the Tempus swap fees, aggregated into one yield.',
  slippageTolerance: 'Slippage tolerance',
  slippageTooltip: 'Your transaction will revert if the price changes unfavorably by more than this percentage.',
  auto: 'Auto',
  language: 'Language',
};
export default en;
