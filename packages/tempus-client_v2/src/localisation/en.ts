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
  selectWallet: 'Select Wallet',
  walletSelectorDisclaimer:
    'By connecting your wallet, you agree to be bound by the <a href="https://tempus.finance/terms-of-service" target="_blank">Tempus Terms of Service</a> and acknowledge that you have read and understand the <a href="https://tempus.finance/disclaimer" target="_blank">Tempus Protocol Disclaimer</a>.',
  metamaskConnected: 'MetaMask connected',
  changeNetworkRejected: 'Request to change network rejected by user',
  changeNetworkRejectedExplain: 'In order to use the app, please connect using Mainnet network',
  unsupportedNetwork: 'Unsupported wallet network',
  unsupportedNetworkExplain: 'We support Mainnet network',
  walletConnectConnected: 'WalletConnect connected',
  errorConnectingWallet: 'Error connecting wallet',
  viewRecentTransactions: 'View recent transactions',
  walletOverview: 'Wallet overview',
  switchWallet: 'Switch Wallet',
  connectedWallet: 'Connected Wallet',
  viewOn: 'View on',
  pendingTransactions: 'Pending Transactions',
  transactionHistory: 'Transaction History',
  clear: 'clear',
  installMetamask: 'Install Metamask',
  availablePools: 'Available Pools',
  filter: 'Filter',
  asset: 'Asset',
  assetName: 'Asset Name',
  protocol: 'Source',
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
  totalValueLocked: 'Total Value Locked',
  manage: 'Manage',
  basic: 'Basic',
  basicSubTitle: 'Recommended option',
  advanced: 'Advanced',
  advancedSubTitle: 'For experienced users',
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  mint: 'Mint',
  removeLiquidity: 'Remove Liquidity',
  provideLiquidity: 'Provide Liquidity',
  earlyRedeem: 'Early Redeem',
  operationDisabledByConfig:
    'Certain actions in relation to this Tempus pool are temporarily disabled due to intermittent unreliability of the underlying pool. Please bear with us while we investigate this issue.',
  askUsOnDiscord:
    'Have more questions? Ask us on Discord: <a href="https://discord.com/invite/6gauHECShr" target="_blank">https://discord.com/invite/6gauHECShr</a>',
  depositDisabledByConfig: 'Depositing is currently not available.',
  mintDisabledByConfig: 'Minting is currently not available.',
  depositDisabledNoLiquidity:
    'Depositing is currently disabled due to insufficient liquidity in the pool you have selected. Please try again later.',
  depositDisabledPoolMaturity: 'Deposit is not available because this pool has reached maturity.',
  depositDisabledNegative:
    'Deposit has temporarily disabled due to negative yield in the pool. Please check back soon.',
  withdrawDisabledNoLiquidity:
    'Withdrawing is currently disabled due to insufficient liquidity in the pool you have selected. Please try again later.',
  withdrawDisabledNoDeposit: 'Withdraw will be available once you have deposited into the pool.',
  withdrawDisabledNegative:
    'Withdrawal has temporarily disabled due to negative yield in the pool. Please check back soon.',
  mintDisabledPoolMaturity: 'Mint is not available because this pool has reached maturity.',
  swapDisabledNoLiquidity:
    'Swapping is currently disabled due to insufficient liquidity in the pool you have selected. Please try again later.',
  swapDisabledNoShares: 'Swap will be available once you have deposited into the pool.',
  swapDisabledPoolMaturity: 'Swap is not available because this pool has reached maturity.',
  provideLiquidityDisabledNoDeposit: 'Manual Liquidity Provision is not available until you have Deposited or Minted.',
  provideLiquidityDisabledNoPrincipals:
    'Manual Liquidity Provision is not available until you have purchased more Principal tokens.',
  provideLiquidityDisabledNoYields:
    'Manual Liquidity Provision is not available until you have purchased more Yield tokens.',
  provideLiquidityDisabledPoolMaturity:
    'Manual Liquidity Provision is not available because this pool has reached maturity.',
  removeLiquidityDisabledNoDeposit:
    'Remove Liquidity will be available once you have staked your tokens (deposited into the TempusAMM).',
  removeLiquidityDisabledNoLpTokens: 'Remove Liquidity will be available once you have added liquidity.',
  removeLiquidityDisabledPoolMaturity:
    "Remove Liquidity is not available because this pool has reached maturity. Please use 'Withdraw'.",
  earlyRedemptionDisabledNoLiquidity:
    'Early redemption is currently disabled due to insufficient liquidity in the pool you have selected. Please try again later.',
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
  insufficientLiquidity: 'Insufficient Liquidity',
  profitLoss: 'Profit & Loss',
  currentValue: 'Current Value',
  from: 'From',
  to: 'To',
  balance: 'Balance',
  futureYield: 'Future Yield',
  lifeTimeYield: 'Lifetime Yield',
  fixYourFutureYield: 'Fix Your Future Yield',
  fixedYield: 'Fixed Yield',
  yieldAtMaturity: 'Yield at maturity',
  estimatedYieldAtMaturity: 'Est. yield at maturity',
  totalAvailableAtMaturity: 'Total available at maturity',
  variableYield: 'Variable Yield',
  amountReceived: 'Amount Received',
  approx: 'Approx',
  estimatedAmountReceived: 'Estimated Amount Received',
  estimated: 'Estimated',
  feesTooltipInfo:
    'Deposit, Redemption, Early Redemption fees accrue to the Tempus Treasury. Swap fees accrue to liquidity providers.',
  selectPlaceholder: 'Please select',
  warningEthGasFees: 'At least 0.05 ETH must be left in your wallet to pay for gas fees.',
  selectTokenFirst: 'Please select the token first',
  about: 'About',
  tempusAnnouncements: 'Tempus Announcements',
  tempusChat: 'Tempus Chat',
  interestRateProtectionTooltipText:
    'Fix your future yield with Tempus. This function locks your Yield Bearing Token, mints Principals and Yields in exchange, and swaps all Yields for Principals through TempusAMM.<br/><br/>You will receive Principals which will be redeemable 1:1 to the Underlying asset on Maturity.',
  liquidityProvisionTooltipText:
    'Provide liquidity to Tempus to earn extra yield. This function locks your Yield Bearing Token, mints Principals and Yields in exchange, and uses the maximum available number of Principals and Yields to provide liquidity to TempusAMM.<br/><br/>This means that you will receive the underlying yield, and the Tempus swap fees, aggregated into one yield.',
  slippageTolerance: 'Slippage tolerance',
  slippageTooltip: 'Your transaction will revert if the price changes unfavorably by more than this percentage.',
  auto: 'Auto',
  language: 'Language',
  mobileNotSupported:
    'Mobile support is not yet available, but will be included at a later time. <br />Thank you for your understanding.',
  mobileLink: 'Read more about Tempus',
  unstaked: 'Unstaked',
  stakedPrincipals: 'Staked Principals',
  stakedYields: 'Staked Yields',
  mintDescription: 'Split your yield bearing token into Principals and Yields.',
  swapDescription: 'Swap between Principals and Yields.',
  provideLiquidityDescription: 'Use your LP tokens to provide liquidity to the pool and earn rewards.',
  removeLiquidityDescription:
    'Remove your liquidity from the pool with the accrued rewards in the form of your initial LP tokens.',
  poolActionDisabledTitle: 'Certain actions to this pool are temporarily disabled',
  selectNetwork: 'Select Network',
};
export default en;
