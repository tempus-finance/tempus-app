import { ethers, BigNumber, Contract } from 'ethers';
import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { debounceTime, from, Observable, of, switchMap } from 'rxjs';
import { Vaults as RariVault } from 'rari-sdk';
import {
  CONSTANTS,
  PoolBalanceChangedEvent,
  TempusAMMService,
  TempusPoolService,
  VaultService,
  SwapEvent,
  decreasePrecision,
  getProviderFromSignerOrProvider,
  increasePrecision,
  wadToDai,
} from 'tempus-core-services';
import * as coreServices from 'tempus-core-services';
import lidoOracleABI from '../abi/LidoOracle.json';
import AaveLendingPoolABI from '../abi/AaveLendingPool.json';
import cERC20Token from '../abi/cERC20Token.json';
import { isPoolBalanceChangedEvent, isSwapEvent } from '../services/EventUtils';
import { ProtocolName } from '../interfaces/ProtocolName';
import { TempusPool } from '../interfaces/TempusPool';
import { YearnData } from '../interfaces/YearnData';
import { ChainConfig } from '../interfaces/Config';
import { getChainConfig } from '../utils/getConfig';
import { Chain } from '../interfaces/Chain';

const {
  DAYS_IN_A_YEAR,
  SECONDS_IN_YEAR,
  ONE_ETH_IN_WEI,
  aaveLendingPoolAddress,
  COMPOUND_BLOCKS_PER_DAY,
  SECONDS_IN_A_DAY,
  AMM_SWAP_FEES_PRECISION,
} = CONSTANTS;
const SECONDS_IN_A_WEEK = SECONDS_IN_A_DAY * 7;
const HOURS_IN_A_YEAR = DAYS_IN_A_YEAR * 24;
const BN_SECONDS_IN_YEAR = BigNumber.from(SECONDS_IN_YEAR);
const BN_ONE_ETH_IN_WEI = BigNumber.from(ONE_ETH_IN_WEI);
const ethMantissa = 1e18;

const intervalBetweenHttpRequestsInMilliseconds = 1000;

class VariableRateService {
  static getAprFromApy(apy: number, periods: number = 1): number {
    if (periods === 1) {
      return apy;
    }
    let result = apy / 100 + 1;
    result = Math.pow(result, 1 / periods);
    result = (result - 1) * periods * 100;
    return result;
  }

  private aaveLendingPool: Contract | null = null;
  private lidoOracle: Contract | null = null;
  private rariVault: RariVault | null = null;
  private tempusPoolService: TempusPoolService | null = null;
  private vaultService: VaultService | null = null;
  private tempusAMMService: TempusAMMService | null = null;
  private tokenAddressToContractMap: { [tokenAddress: string]: ethers.Contract } = {};
  private signerOrProvider: JsonRpcSigner | JsonRpcProvider | null = null;
  private chainConfig: ChainConfig | null = null;

  init(
    signerOrProvider: JsonRpcSigner | JsonRpcProvider,
    tempusPoolService: TempusPoolService,
    vaultService: VaultService,
    tempusAMMService: TempusAMMService,
    rariVault: RariVault,
    config: ChainConfig,
  ) {
    if (signerOrProvider) {
      // Only connect to Lido Oracle contract if address for it is specified in blockchain config
      if (config.lidoOracle) {
        this.lidoOracle = new Contract(config.lidoOracle, lidoOracleABI.abi, signerOrProvider);
      }

      this.aaveLendingPool = new Contract(aaveLendingPoolAddress, AaveLendingPoolABI, signerOrProvider);
      this.rariVault = rariVault;
      this.signerOrProvider = signerOrProvider;
      this.tempusPoolService = tempusPoolService;
      this.vaultService = vaultService;
      this.tempusAMMService = tempusAMMService;
      this.chainConfig = config;
    }
  }

  async calculateFees(
    tempusAMM: string,
    tempusPool: string,
    principalsAddress: string,
    yieldsAddress: string,
    chain: Chain,
    averageBlockTime: number,
  ) {
    if (!this.tempusAMMService || !this.vaultService || !this.tempusPoolService || !this.signerOrProvider) {
      return Promise.reject();
    }

    const poolConfig = getChainConfig(chain).tempusPools.find(pool => pool.address === tempusPool);
    if (!poolConfig) {
      return Promise.reject();
    }

    let provider = getProviderFromSignerOrProvider(this.signerOrProvider);

    const [latestBlock, swapFeePercentage] = await Promise.all([
      provider.getBlock('latest'),
      this.tempusAMMService.getSwapFeePercentage(tempusAMM),
    ]);

    // 7 days old block number (approximate)
    const earlierBlock = await provider.getBlock(latestBlock.number - Math.floor(SECONDS_IN_A_WEEK / averageBlockTime));

    // Timestamp of 7 days old block or pool start time (whichever of the two is closer to current date)
    const laterBlock = Math.max(poolConfig.startDate, earlierBlock.timestamp * 1000);

    // Number of hours from 7 days old block to now (or pool start time to now, whichever of the two is closer to current date)
    const hoursBetweenLatestAndLater = ((latestBlock.timestamp * 1000 - laterBlock) / (60 * 60 * 1000)).toFixed(
      poolConfig.tokenPrecision.principals,
    );

    // We want to fetch events for last 7 days
    const fetchEventsFromBlock = earlierBlock.number;

    const sortedEvents = await this.getSwapAndPoolBalanceChangedEvents(poolConfig, fetchEventsFromBlock);

    // Fetch current pool balance
    let { principals, yields } = await this.getPoolTokens(poolConfig.poolId, principalsAddress, yieldsAddress);

    // Calculate current principals to yields ratio
    let currentPrincipalsToYieldsRatio = ethers.utils.parseUnits('1', poolConfig.tokenPrecision.principals);
    if (!principals.isZero() && !yields.isZero()) {
      currentPrincipalsToYieldsRatio = coreServices.div18f(principals, yields, poolConfig.tokenPrecision.principals);
    }

    // Total fees accumulated
    let totalFees = BigNumber.from('0');

    // Go over all events and accumulate total swap fees
    sortedEvents.forEach(event => {
      if (isSwapEvent(event)) {
        const adjust = this.adjustPrincipalForSwapEvent(
          event,
          principalsAddress,
          principals,
          totalFees,
          swapFeePercentage,
          poolConfig.tokenPrecision.principals,
        );
        principals = adjust.principals;
        totalFees = adjust.totalFees;
      }

      if (isPoolBalanceChangedEvent(event)) {
        principals = this.adjustPrincipalForPoolBalanceChangedEvent(event, principalsAddress, principals);
      }
    });

    // Scale accumulated fees to 1 year duration
    const scaledFees = coreServices.mul18f(
      coreServices.div18f(
        totalFees,
        ethers.utils.parseUnits(hoursBetweenLatestAndLater, poolConfig.tokenPrecision.principals),
        poolConfig.tokenPrecision.principals,
      ),
      ethers.utils.parseUnits(HOURS_IN_A_YEAR.toString(), poolConfig.tokenPrecision.principals),
      poolConfig.tokenPrecision.principals,
    );

    return coreServices.mul18f(scaledFees, currentPrincipalsToYieldsRatio, poolConfig.tokenPrecision.principals);
  }

  private async getSwapAndPoolBalanceChangedEvents(
    poolConfig: TempusPool,
    fetchEventsFromBlock: number,
  ): Promise<(SwapEvent | PoolBalanceChangedEvent)[]> {
    if (!this.vaultService) {
      return Promise.reject();
    }

    // Fetch swap and poolBalanceChanged events
    const [swapEvents, poolBalanceChangedEvents] = await Promise.all([
      this.vaultService.getSwapEvents({ forPoolId: poolConfig.poolId, fromBlock: fetchEventsFromBlock }),
      this.vaultService.getPoolBalanceChangedEvents(poolConfig.poolId, fetchEventsFromBlock),
    ]);

    const events = [...swapEvents, ...poolBalanceChangedEvents];

    // Sort events from newest to oldest
    const sortedEvents = events.sort((a, b) => b.blockNumber - a.blockNumber);

    return sortedEvents;
  }

  private adjustPrincipalForSwapEvent(
    event: SwapEvent,
    principalsAddress: string,
    principals: BigNumber,
    totalFees: BigNumber,
    swapFeePercentage: BigNumber,
    principalsPrecision: number,
  ): { principals: BigNumber; totalFees: BigNumber } {
    let adjustedSwapFeePrecision = swapFeePercentage;
    if (principalsPrecision > AMM_SWAP_FEES_PRECISION) {
      adjustedSwapFeePrecision = increasePrecision(swapFeePercentage, principalsPrecision - AMM_SWAP_FEES_PRECISION);
    } else if (principalsPrecision < AMM_SWAP_FEES_PRECISION) {
      adjustedSwapFeePrecision = decreasePrecision(swapFeePercentage, AMM_SWAP_FEES_PRECISION - principalsPrecision);
    }

    // Get swap event volume
    let eventVolume: BigNumber = BigNumber.from('0');
    if (event.args.tokenIn === principalsAddress) {
      eventVolume = event.args.amountIn;
    } else if (event.args.tokenOut === principalsAddress) {
      eventVolume = coreServices.mul18f(
        coreServices.div18f(
          adjustedSwapFeePrecision,
          ethers.utils.parseUnits('1', principalsPrecision).sub(adjustedSwapFeePrecision),
          principalsPrecision,
        ),
        event.args.amountOut,
        principalsPrecision,
      );
    }

    // Calculate swap fees for current swap event
    const swapFeesVolume = coreServices.mul18f(eventVolume, adjustedSwapFeePrecision, principalsPrecision);
    const liquidityProvided = principals.sub(swapFeesVolume);
    const feePerPrincipalShare = coreServices.div18f(swapFeesVolume, liquidityProvided, principalsPrecision);
    totalFees = totalFees.add(feePerPrincipalShare);

    // Adjust pool balance based on swapped amounts
    if (event.args.tokenIn === principalsAddress) {
      principals = principals.sub(event.args.amountIn);
    } else if (event.args.tokenOut === principalsAddress) {
      principals = principals.add(event.args.amountOut);
    }

    return { principals, totalFees };
  }

  private adjustPrincipalForPoolBalanceChangedEvent(
    event: PoolBalanceChangedEvent,
    principalsAddress: string,
    principals: BigNumber,
  ): BigNumber {
    // Adjust current balance based on PoolBalanceChangedEvent
    const principalsIndexInBalanceChange = event.args.tokens.findIndex(
      poolTokenAddress => principalsAddress === poolTokenAddress,
    );
    const principalsDelta = event.args.deltas[principalsIndexInBalanceChange];
    principals = principalsDelta.isNegative()
      ? principals.add(principalsDelta.abs())
      : principals.sub(principalsDelta.abs());

    return principals;
  }

  async getAprRate(
    protocol: ProtocolName,
    yieldBearingTokenAddress: string,
    fees: BigNumber,
    feesPrecision: number,
  ): Promise<number> {
    if (!this.tempusPoolService) {
      return Promise.reject();
    }

    const feesFormatted = Number(ethers.utils.formatUnits(fees, feesPrecision));

    switch (protocol) {
      case 'aave': {
        return this.getAaveAPR(yieldBearingTokenAddress, feesFormatted);
      }

      case 'compound': {
        return this.getCompoundAPR(yieldBearingTokenAddress, feesFormatted);
      }

      case 'lido': {
        return this.getLidoAPR(feesFormatted);
      }

      case 'rari': {
        return this.getRariAPR(feesFormatted);
      }

      case 'yearn': {
        return this.getYearnAPR(yieldBearingTokenAddress, feesFormatted);
      }

      default: {
        return 0;
      }
    }
  }

  private async getAaveAPR(yieldBearingTokenAddress: string, fees: number) {
    const aaveAPR = VariableRateService.getAprFromApy(await this.getAaveAPY(yieldBearingTokenAddress));
    return aaveAPR + fees;
  }

  private async getCompoundAPR(yieldBearingTokenAddress: string, fees: number) {
    if (!this.tempusPoolService) {
      return Promise.reject();
    }
    const compoundAPR = VariableRateService.getAprFromApy(await this.getCompoundAPY(yieldBearingTokenAddress));
    return compoundAPR + fees;
  }

  // Ref - https://docs.lido.fi/contracts/lido-oracle/#add-calculation-of-staker-rewards-apr
  private async getLidoAPR(fees: number): Promise<number> {
    try {
      const { postTotalPooledEther, preTotalPooledEther, timeElapsed } =
        await this.lidoOracle?.getLastCompletedReportDelta();

      const apr = this.calculateLidoAPR(postTotalPooledEther, preTotalPooledEther, timeElapsed);

      // currently 10%. it's possible to query it using Lido.getFee()
      const aprMinusLidoFees = apr.mul(BigNumber.from('9000')).div(BigNumber.from('10000'));

      return Number(ethers.utils.formatEther(aprMinusLidoFees)) + fees;
    } catch (error) {
      console.error('VariableRateService - getLidoAPR', error);
      return 0;
    }
  }

  private calculateLidoAPR(
    postTotalPooledEther: BigNumber,
    preTotalPooledEther: BigNumber,
    timeElapsed: BigNumber,
  ): BigNumber {
    try {
      return postTotalPooledEther
        .sub(preTotalPooledEther)
        .mul(BN_SECONDS_IN_YEAR)
        .mul(BN_ONE_ETH_IN_WEI)
        .div(preTotalPooledEther.mul(timeElapsed));
    } catch (error) {
      console.error('VariableRateService - calculateLidoAPR', error);
      return BigNumber.from(0);
    }
  }

  // https://github.com/Rari-Capital/RariSDK/blob/d6293e09c36a4ac6914725f5a5528a9c1e7cb178/src/Vaults/pools/stable.ts#L473
  private async getRariAPR(fees: number) {
    if (!this.rariVault) {
      return Promise.reject();
    }

    const currentRariApy: BigNumber = await this.rariVault.pools.stable.apy.getCurrentApy();
    const parsedCurrentRariApy: number = Number(ethers.utils.formatEther(currentRariApy));
    const rariAPR = VariableRateService.getAprFromApy(parsedCurrentRariApy);

    return rariAPR + fees;
  }

  private async getPoolTokens(poolId: string, principalsAddress: string, yieldsAddress: string) {
    if (!this.vaultService) {
      return Promise.reject();
    }

    const poolTokens = await this.vaultService.getPoolTokens(poolId);
    const principalsIndex = poolTokens.tokens.findIndex(poolTokenAddress => principalsAddress === poolTokenAddress);
    const yieldsIndex = poolTokens.tokens.findIndex(poolTokenAddress => yieldsAddress === poolTokenAddress);
    return {
      principals: poolTokens.balances[principalsIndex],
      yields: poolTokens.balances[yieldsIndex],
    };
  }

  private async getAaveAPY(yieldBearingTokenAddress: string): Promise<number> {
    try {
      const { currentLiquidityRate } = await this.aaveLendingPool?.getReserveData(yieldBearingTokenAddress);
      const aaveAPY = Number(ethers.utils.formatEther(wadToDai(currentLiquidityRate)));
      return aaveAPY;
    } catch (error) {
      console.error('VariableRateService - getAaveAPY', error);
      return 0;
    }
  }

  private async getCompoundAPY(yieldBearingTokenAddress: string): Promise<number> {
    if (!this.signerOrProvider) {
      return 0;
    }

    try {
      let supplyRatePerBlock;
      if (this.tokenAddressToContractMap[yieldBearingTokenAddress] === undefined) {
        this.tokenAddressToContractMap[yieldBearingTokenAddress] = new Contract(
          yieldBearingTokenAddress,
          cERC20Token,
          this.signerOrProvider,
        );
      }
      supplyRatePerBlock = await this.tokenAddressToContractMap[yieldBearingTokenAddress].supplyRatePerBlock();
      const supplyApy = Math.pow((supplyRatePerBlock / ethMantissa) * COMPOUND_BLOCKS_PER_DAY + 1, DAYS_IN_A_YEAR) - 1;

      return supplyApy;
    } catch (error) {
      console.error('VariableRateService - getCompoundAPY', error);
      return 0;
    }
  }

  // https://docs.yearn.finance/vaults/yearn-api
  private async getYearnAPR(yieldBearingTokenAddress: string, fees: number): Promise<number> {
    const yearnAPY = await this.getYearnAPY(yieldBearingTokenAddress);
    const yearnAPR = VariableRateService.getAprFromApy(yearnAPY);

    return yearnAPR ? yearnAPR + fees : 0;
  }

  private async getYearnAPY(yieldBearingTokenAddress: string): Promise<number> {
    return new Promise(resolve => {
      this.fetchYearnData().subscribe(yearnData => {
        if (yearnData) {
          const data = yearnData.filter(data => data.address === yieldBearingTokenAddress);
          if (data && data.length) {
            return resolve(data[0].apy.net_apy);
          }
        }

        return resolve(0);
      });
    });
  }

  private fetchYearnData(): Observable<YearnData[] | null> {
    if (!this.chainConfig) {
      throw new Error(
        'VariableRateService - fetchYearnData() - Attempted to use VariableRateService before initializing it!',
      );
    }

    try {
      const yearnEndpoint = `https://api.yearn.finance/v1/chains/${this.chainConfig?.chainId}/vaults/all`;

      return from(fetch(yearnEndpoint)).pipe(
        debounceTime(intervalBetweenHttpRequestsInMilliseconds),
        switchMap((response: Response) => response.json()),
      );
    } catch (error) {
      console.error('VariableRateService - getYearnData', error);
      return of(null);
    }
  }
}

export default VariableRateService;
