import { ethers, BigNumber, Contract } from 'ethers';
import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import lidoOracleABI from '../abi/LidoOracle.json';
import AaveLendingPoolABI from '../abi/AaveLendingPool.json';
import cERC20Token from '../abi/cERC20Token.json';
import {
  DAYS_IN_A_YEAR,
  SECONDS_IN_YEAR,
  ONE_ETH_IN_WEI,
  aaveLendingPoolAddress,
  COMPOUND_BLOCKS_PER_DAY,
  SECONDS_IN_A_DAY,
  BLOCK_DURATION_SECONDS,
} from '../constants';
import TempusPoolService from '../services/TempusPoolService';
import VaultService from '../services/VaultService';
import TempusAMMService from '../services/TempusAMMService';
import { isPoolBalanceChangedEvent, isSwapEvent } from '../services/EventUtils';
import { ProtocolName } from '../interfaces/ProtocolName';
import { Config } from '../interfaces/Config';
import { wadToDai } from '../utils/rayToDai';
import getConfig from '../utils/getConfig';
import { div18f, mul18f } from '../utils/weiMath';
import getProvider from '../utils/getProvider';

const SECONDS_IN_A_WEEK = SECONDS_IN_A_DAY * 7;
const HOURS_IN_A_YEAR = DAYS_IN_A_YEAR * 24;
const BN_SECONDS_IN_YEAR = BigNumber.from(SECONDS_IN_YEAR);
const BN_ONE_ETH_IN_WEI = BigNumber.from(ONE_ETH_IN_WEI);
const ethMantissa = 1e18;

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
  private tempusPoolService: TempusPoolService | null = null;
  private vaultService: VaultService | null = null;
  private tempusAMMService: TempusAMMService | null = null;
  private tokenAddressToContractMap: { [tokenAddress: string]: ethers.Contract } = {};
  private signerOrProvider: JsonRpcSigner | JsonRpcProvider | null = null;

  init(
    signerOrProvider: JsonRpcSigner | JsonRpcProvider,
    tempusPoolService: TempusPoolService,
    vaultService: VaultService,
    tempusAMMService: TempusAMMService,
    config: Config,
  ) {
    if (signerOrProvider) {
      this.aaveLendingPool = new Contract(aaveLendingPoolAddress, AaveLendingPoolABI, signerOrProvider);
      this.lidoOracle = new Contract(config.lidoOracle, lidoOracleABI.abi, signerOrProvider);
      this.signerOrProvider = signerOrProvider;
      this.tempusPoolService = tempusPoolService;
      this.vaultService = vaultService;
      this.tempusAMMService = tempusAMMService;
    }
  }

  async getAprRate(protocol: ProtocolName, yieldBearingTokenAddress: string, fees: BigNumber): Promise<number> {
    if (!this.tempusPoolService) {
      return Promise.reject();
    }

    const feesFormatted = Number(ethers.utils.formatEther(fees));

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
    return postTotalPooledEther
      .sub(preTotalPooledEther)
      .mul(BN_SECONDS_IN_YEAR)
      .mul(BN_ONE_ETH_IN_WEI)
      .div(preTotalPooledEther.mul(timeElapsed));
  }

  public async calculateFees(tempusAMM: string, tempusPool: string, principalsAddress: string, yieldsAddress: string) {
    if (!this.tempusAMMService || !this.vaultService || !this.tempusPoolService || !this.signerOrProvider) {
      return Promise.reject();
    }

    const poolConfig = getConfig().tempusPools.find(pool => pool.address === tempusPool);
    if (!poolConfig) {
      return Promise.reject();
    }

    let provider = getProvider(this.signerOrProvider);

    const [latestBlock, swapFeePercentage] = await Promise.all([
      provider.getBlock('latest'),
      this.tempusAMMService.getSwapFeePercentage(tempusAMM),
    ]);

    const { startDate } = poolConfig;

    const earlierBlock = await provider.getBlock(
      latestBlock.number - Math.floor(SECONDS_IN_A_WEEK / BLOCK_DURATION_SECONDS),
    );

    const laterBlock = startDate >= earlierBlock.timestamp * 1000 ? startDate : earlierBlock.timestamp * 1000;
    const hoursBetweenLatestAndLater = Math.floor((latestBlock.timestamp * 1000 - laterBlock) / (60 * 60 * 1000));

    const fetchEventsFromBlock = latestBlock.number - earlierBlock.number;

    // Fetch swap and poolBalanceChanged events
    const [swapEvents, poolBalanceChangedEvents] = await Promise.all([
      this.vaultService.getSwapEvents({ forPoolId: poolConfig.poolId, fromBlock: fetchEventsFromBlock }),
      this.vaultService.getPoolBalanceChangedEvents(poolConfig.poolId, fetchEventsFromBlock),
    ]);

    const events = [...swapEvents, ...poolBalanceChangedEvents];

    // Sort events from newest to oldest
    const sortedEvents = events.sort((a, b) => b.blockNumber - a.blockNumber);

    // Fetch current pool balance
    let { principals, yields } = await this.getPoolTokens(poolConfig.poolId, principalsAddress, yieldsAddress);

    // Calculate current principals to yields ratio
    let currentPrincipalsToYieldsRatio = ethers.utils.parseEther('1');
    if (!principals.isZero() && !yields.isZero()) {
      currentPrincipalsToYieldsRatio = div18f(principals, yields);
    }

    // Total fees accumulated
    let totalFees = BigNumber.from('0');

    // Go over all events and accumulate total swap fees
    sortedEvents.forEach(event => {
      if (!this.tempusAMMService || !this.tempusPoolService) {
        return Promise.reject();
      }

      if (isSwapEvent(event)) {
        // Get swap event volume
        let eventVolume: BigNumber = BigNumber.from('0');
        if (event.args.tokenIn === principalsAddress) {
          eventVolume = event.args.amountIn;
        } else if (event.args.tokenOut === principalsAddress) {
          eventVolume = mul18f(
            div18f(swapFeePercentage, ethers.utils.parseEther('1').sub(swapFeePercentage)),
            event.args.amountOut,
          );
        }

        // Calculate swap fees for current swap event
        const swapFeesVolume = mul18f(eventVolume, swapFeePercentage);
        const liquidityProvided = principals.sub(swapFeesVolume);
        const feePerPrincipalShare = div18f(swapFeesVolume, liquidityProvided);
        totalFees = totalFees.add(feePerPrincipalShare);

        // Adjust pool balance based on swapped amounts
        if (event.args.tokenIn === principalsAddress) {
          principals = principals.sub(event.args.amountIn);
        } else {
          principals = principals.add(event.args.amountOut);
        }
      }

      if (isPoolBalanceChangedEvent(event)) {
        // Adjust current balance based on PoolBalanceChangedEvent
        const principalsIndexInBalanceChange = event.args.tokens.findIndex(
          poolTokenAddress => principalsAddress === poolTokenAddress,
        );
        const principalsDelta = event.args.deltas[principalsIndexInBalanceChange];
        principals = principalsDelta.isNegative()
          ? principals.add(principalsDelta.abs())
          : principals.sub(principalsDelta.abs());
      }
    });

    // Scale accumulated fees to 1 year duration

    const scaledFees = mul18f(
      div18f(totalFees, ethers.utils.parseEther(hoursBetweenLatestAndLater.toString())),
      ethers.utils.parseEther(HOURS_IN_A_YEAR.toString()),
    );

    return mul18f(scaledFees, currentPrincipalsToYieldsRatio);
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
      console.error('VariableRateService - getAaveAPR', error);
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
}

export default VariableRateService;
