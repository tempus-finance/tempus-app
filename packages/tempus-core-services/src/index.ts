import ERC20ABI from './abi/ERC20.json';
import VaultABI from './abi/Vault.json';

export { ERC20ABI, VaultABI };

export type { ERC20 } from './abi';

export type {
  Chain,
  ChainConfig,
  Config,
  PoolShares,
  ProtocolDisplayName,
  ProtocolName,
  Ticker,
  NativeTokenTicker,
  TempusPool,
  TokenPrecision,
  TokenTypePrecision,
  YearnData,
  YearnDataApy,
  YearnDataToken,
} from './interfaces';

export type {
  DepositedEvent,
  ERC20TokenService,
  PoolBalanceChangedEvent,
  PoolBalanceChangedEventListener,
  RedeemedEvent,
  TempusAMMJoinKind,
  TempusAMMExitKind,
  TempusAMMService,
  TempusControllerService,
  TempusPoolService,
  TransferEventListener,
  VaultService,
  StatisticsService,
  StorageService,
  SwapEvent,
} from './services';

export type { Numberish } from './datastructures';

export { Decimal } from './datastructures';

export { SwapKind } from './services';

export {
  getChainlinkFeed,
  getCoingeckoRate,
  getDefaultProvider,
  getERC20TokenService,
  getTempusAMMService,
  getTempusControllerService,
  getTempusPoolService,
  getVariableRateService,
  getStatisticsService,
  getStorageService,
  getVaultService,
} from './services';

export {
  NumberUtils,
  DecimalUtils,
  capitalize,
  chainIdToChainName,
  chainNameToHexChainId,
  chainToTicker,
  decreasePrecision,
  div18f,
  getCookie,
  getLibrary,
  getPastDaysNumber,
  getProvider,
  getProviderFromSignerOrProvider,
  getRangeFrom,
  getTokenPrecision,
  increasePrecision,
  isZeroString,
  mul18f,
  prettifyChainName,
  prettifyChainNameLong,
  rayToDai,
  reverseString,
  shortenAccount,
  wadToDai,
  wait,
} from './utils';

export * from './constants';
