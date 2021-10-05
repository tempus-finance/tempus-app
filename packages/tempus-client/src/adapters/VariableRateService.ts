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
} from '../constants';
import TempusPoolService from '../services/TempusPoolService';
import VaultService from '../services/VaultService';
import TempusAMMService from '../services/TempusAMMService';
import { isPoolBalanceChangedEvent, isSwapEvent } from '../services/EventUtils';
import { ProtocolName } from '../interfaces';
import { wadToDai } from '../utils/rayToDai';
import getConfig from '../utils/get-config';
import { div18f, mul18f } from '../utils/wei-math';

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
  ) {
    if (signerOrProvider) {
      this.aaveLendingPool = new Contract(aaveLendingPoolAddress, AaveLendingPoolABI, signerOrProvider);
      this.lidoOracle = new Contract(getConfig().lidoOracle, lidoOracleABI.abi, signerOrProvider);
      this.signerOrProvider = signerOrProvider;
      this.tempusPoolService = tempusPoolService;
      this.vaultService = vaultService;
      this.tempusAMMService = tempusAMMService;
    }
  }

  async getAprRate(
    protocol: ProtocolName,
    tempusPoolAddress: string,
    tempusAMM: string,
    principalsAddress: string,
    yieldsAddress: string,
  ): Promise<number> {
    let yieldBearingTokenAddress: string = '';
    switch (protocol) {
      case 'aave': {
        if (tempusPoolAddress && this.tempusPoolService) {
          yieldBearingTokenAddress = await this.tempusPoolService.getYieldBearingTokenAddress(tempusPoolAddress);
          return VariableRateService.getAprFromApy(await this.getAaveAPY(yieldBearingTokenAddress));
        }
        return 0;
      }

      case 'compound': {
        if (tempusPoolAddress && this.tempusPoolService) {
          yieldBearingTokenAddress = await this.tempusPoolService?.getYieldBearingTokenAddress(tempusPoolAddress);
          return VariableRateService.getAprFromApy(await this.getCompoundAPY(yieldBearingTokenAddress));
        }
        return 0;
      }

      case 'lido': {
        return this.getLidoAPR(tempusAMM, tempusPoolAddress, principalsAddress, yieldsAddress);
      }

      default: {
        return 0;
      }
    }
  }

  private async getLidoAPR(
    tempusAMM: string,
    tempusPool: string,
    principalsAddress: string,
    yieldsAddress: string,
  ): Promise<number> {
    try {
      const { postTotalPooledEther, preTotalPooledEther, timeElapsed } =
        await this.lidoOracle?.getLastCompletedReportDelta();
      const apr = this.calculateLidoAPR(postTotalPooledEther, preTotalPooledEther, timeElapsed);
      const fees = await this.calculateFees(tempusAMM, tempusPool, principalsAddress, yieldsAddress);
      return Number(ethers.utils.formatEther(apr.add(fees)));
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

  private async calculateFees(tempusAMM: string, tempusPool: string, principalsAddress: string, yieldsAddress: string) {
    if (!this.tempusAMMService || !this.vaultService || !this.tempusPoolService) {
      return Promise.reject();
    }

    const swapFeePercentage = await this.tempusAMMService.getSwapFeePercentage(tempusAMM);
    const poolId = await this.tempusAMMService.poolId(tempusAMM);

    // Fetch swap and poolBalanceChanged events
    const [swapEvents, poolBalanceChangedEvents] = await Promise.all([
      this.vaultService.getSwapEvents(poolId),
      this.vaultService.getPoolBalanceChangedEvents(poolId),
    ]);

    const events = [...swapEvents, ...poolBalanceChangedEvents];

    // Fetch block data for all events
    const eventBlockPromises: Promise<ethers.providers.Block>[] = [];
    events.forEach(swapEvent => {
      eventBlockPromises.push(swapEvent.getBlock());
    });
    const eventBlocks = await Promise.all(eventBlockPromises);

    // Filter out events older then 24 hours
    const filteredEvents = events.filter(event => {
      const eventBlock = eventBlocks.find(eventBlock => eventBlock.number === event.blockNumber);
      if (!eventBlock) {
        return false;
      }
      if (eventBlock.timestamp > Date.now() / 1000 - SECONDS_IN_A_DAY) {
        return true;
      }
      return false;
    });

    // Sort events by from newest to oldest
    const sortedEvents = filteredEvents.sort((a, b) => b.blockNumber - a.blockNumber);

    // Fetch current pool balance
    const poolTokens = await this.vaultService.getPoolTokens(poolId);
    const principalsIndex = poolTokens.tokens.findIndex(poolTokenAddress => principalsAddress === poolTokenAddress);
    const yieldsIndex = poolTokens.tokens.findIndex(poolTokenAddress => yieldsAddress === poolTokenAddress);
    let poolPrincipalsBalance = poolTokens.balances[principalsIndex];
    let poolYieldsBalance = poolTokens.balances[yieldsIndex];

    // Total volume accumulated between two PoolBalanceChanged events
    let totalVolume = BigNumber.from('0');

    // Total fees accumulated
    let totalFees = BigNumber.from('0');

    // Calculate scale factor based on pool duration
    const [tempusPoolStartTime, tempusPoolMaturityTime] = await Promise.all([
      this.tempusPoolService.getStartTime(tempusPool),
      this.tempusPoolService.getMaturityTime(tempusPool),
    ]);
    const poolDuration = (tempusPoolMaturityTime.getTime() - tempusPoolStartTime.getTime()) / 1000;
    const scaleFactor = ethers.utils.parseEther(((SECONDS_IN_A_DAY * DAYS_IN_A_YEAR) / poolDuration).toString());

    // Go over all events and accumulate total swap fees
    sortedEvents.forEach(event => {
      if (!this.tempusAMMService || !this.tempusPoolService) {
        return Promise.reject();
      }

      // If event is a swap event, add it's value to current totalVolume
      if (isSwapEvent(event)) {
        if (event.args.tokenIn === principalsAddress) {
          totalVolume = totalVolume.add(event.args.amountIn);
        } else if (event.args.tokenOut === principalsAddress) {
          totalVolume = totalVolume.add(
            mul18f(
              div18f(swapFeePercentage, ethers.utils.parseEther('1').sub(swapFeePercentage)),
              event.args.amountOut,
            ),
          );
        }
      } else if (isPoolBalanceChangedEvent(event)) {
        // Calculate swap fees for currently accumulated value
        const swapFeesVolume = mul18f(totalVolume, swapFeePercentage);
        const liquidityProvided = poolPrincipalsBalance.sub(swapFeesVolume);
        const swapFeesToLiquidityProvidedRatio = div18f(swapFeesVolume, liquidityProvided);
        const principalsToYieldsRatio = div18f(poolPrincipalsBalance, poolYieldsBalance);
        const feePerPrincipalShare = mul18f(swapFeesToLiquidityProvidedRatio, principalsToYieldsRatio);
        totalFees = totalFees.add(feePerPrincipalShare);

        // Reset total volume accumulated
        totalVolume = BigNumber.from('0');

        // Adjust current balance based on PoolBalanceChangedEvent
        const principalsIndexInBalanceChange = event.args.tokens.findIndex(
          poolTokenAddress => principalsAddress === poolTokenAddress,
        );
        const yieldsIndexInBalanceChange = event.args.tokens.findIndex(
          poolTokenAddress => yieldsAddress === poolTokenAddress,
        );
        const principalsDelta = event.args.deltas[principalsIndexInBalanceChange];
        const yieldsDelta = event.args.deltas[yieldsIndexInBalanceChange];
        principalsDelta.isNegative()
          ? (poolPrincipalsBalance = poolPrincipalsBalance.add(principalsDelta.abs()))
          : (poolPrincipalsBalance = poolPrincipalsBalance.sub(principalsDelta.abs()));
        yieldsDelta.isNegative()
          ? (poolYieldsBalance = poolYieldsBalance.add(yieldsDelta.abs()))
          : (poolYieldsBalance = poolYieldsBalance.sub(yieldsDelta.abs()));
      }
    });

    // Scale accumulated fees to 1 year duration
    return mul18f(totalFees, scaleFactor);
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
