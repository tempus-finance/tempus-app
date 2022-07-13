import { Chain, ChainConfig, Config } from '../interfaces';
import { getVariableRateService } from './getVariableRateService';
import { getTempusPoolService } from './getTempusPoolService';
import { getTempusControllerService } from './getTempusControllerService';
import { getStatisticsService } from './getStatisticsService';
import { getVaultService } from './getVaultService';
import { getWalletBalanceService } from './getWalletBalanceService';
import { TempusPoolService } from './TempusPoolService';
import { TempusControllerService } from './TempusControllerService';
import { StatisticsService } from './StatisticsService';
import { VaultService } from './VaultService';
import { VariableRateService } from './VariableRateService';
import { WalletBalanceService } from './WalletBalanceService';
import { getPoolBalanceService } from './getPoolBalanceService';
import { PoolBalanceService } from './PoolBalanceService';
import { getERC20TokenService } from './getERC20TokenService';
import { getWithdrawService } from './getWithdrawService';
import { WithdrawService } from './WithdrawService';
import { DepositService } from './DepositService';
import { getDepositService } from './getDepositService';
import { PoolInterestRateService } from './PoolInterestRateService';
import { getPoolInterestRateService } from './getPoolInterestRateService';
import { TempusAMMService } from './TempusAMMService';
import { getTempusAMMService } from './getTempusAMMService';

type ServiceMap = {
  TempusPoolService: TempusPoolService;
  TempusControllerService: TempusControllerService;
  TempusAMMService: TempusAMMService;
  StatisticsService: StatisticsService;
  VaultService: VaultService;
  VariableRateService: VariableRateService;
  WalletBalanceService: WalletBalanceService;
  PoolBalanceService: PoolBalanceService;
  WithdrawService: WithdrawService;
  DepositService: DepositService;
  PoolInterestRateService: PoolInterestRateService;
  ERC20TokenServiceGetter: typeof getERC20TokenService;
};

const serviceMap = new Map<Chain, ServiceMap>();

export const initServices = (chain: Chain, config: Config): void => {
  const getChainConfig = (selectedChain: Chain): ChainConfig => config[selectedChain];
  const getConfig = () => config;

  const services: ServiceMap = {
    TempusPoolService: getTempusPoolService(chain, getChainConfig),
    TempusControllerService: getTempusControllerService(chain, getChainConfig),
    TempusAMMService: getTempusAMMService(chain, getChainConfig),
    StatisticsService: getStatisticsService(chain, getConfig, getChainConfig),
    VaultService: getVaultService(chain, getChainConfig),
    VariableRateService: getVariableRateService(chain, getChainConfig),
    WalletBalanceService: getWalletBalanceService(chain, getConfig),
    PoolBalanceService: getPoolBalanceService(chain, getConfig),
    WithdrawService: getWithdrawService(chain, getConfig),
    DepositService: getDepositService(chain, getConfig),
    PoolInterestRateService: getPoolInterestRateService(chain, getConfig),
    ERC20TokenServiceGetter: getERC20TokenService,
  };

  // TODO if the map has already a chain we should destroy the services
  serviceMap.set(chain, services);
};

export const getServices = (chain: Chain): ServiceMap | null =>
  serviceMap.has(chain) ? (serviceMap.get(chain) as ServiceMap) : null;

export const getDefinedServices = (chain: Chain): ServiceMap => {
  const services = getServices(chain);
  if (!services) {
    throw new Error(`Cannot get service map for ${chain}`);
  }
  return services;
};
