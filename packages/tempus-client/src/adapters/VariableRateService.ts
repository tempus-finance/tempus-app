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
import { ProtocolName } from '../interfaces';
import { wadToDai } from '../utils/rayToDai';
import getConfig from '../utils/get-config';
import VaultService from '../services/VaultService';
import TempusAMMService from '../services/TempusAMMService';
import { getEventBackingTokenValue } from '../services/EventUtils';
import { div18f, mul18f } from '../utils/wei-math';

const BN_SECONDS_IN_YEAR = BigNumber.from(SECONDS_IN_YEAR);
const BN_ONE_ETH_IN_WEI = BigNumber.from(ONE_ETH_IN_WEI);
const ethMantissa = 1e18;

// TODO retrieve fees from contract?
const fees = 0.1;

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
      const aprPlusFees = this.calculateFees(tempusAMM, tempusPool, principalsAddress, yieldsAddress);
      return Number(ethers.utils.formatEther('0'));
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
    const swapEvents = await this.vaultService.getSwapEvents(poolId);

    const eventBlockPromises: Promise<ethers.providers.Block>[] = [];
    swapEvents.forEach(swapEvent => {
      eventBlockPromises.push(swapEvent.getBlock());
    });
    const eventBlocks = await Promise.all(eventBlockPromises);

    const eventValuePromises: Promise<BigNumber>[] = [];
    swapEvents.forEach(swapEvent => {
      if (!this.tempusAMMService || !this.tempusPoolService) {
        return Promise.reject();
      }

      const eventBlock = eventBlocks.find(eventBlock => eventBlock.number === swapEvent.blockNumber);
      if (!eventBlock) {
        return Promise.reject();
      }

      // Only include swap events from last 24 hours
      if (eventBlock.timestamp > Date.now() / 1000 - SECONDS_IN_A_DAY) {
        if (swapEvent.args.tokenIn === principalsAddress) {
          eventValuePromises.push(Promise.resolve(swapEvent.args.amountIn));
        } else if (swapEvent.args.tokenOut === principalsAddress) {
          eventValuePromises.push(
            Promise.resolve(
              mul18f(
                div18f(swapFeePercentage, ethers.utils.parseEther('1').sub(swapFeePercentage)),
                swapEvent.args.amountOut,
              ),
            ),
          );
        }
      }
    });

    const eventValues = await Promise.all(eventValuePromises);
    let totalVolume = BigNumber.from('0');
    eventValues.forEach(eventValue => {
      totalVolume = totalVolume.add(eventValue);
    });

    const swapFees = mul18f(totalVolume, swapFeePercentage);

    const poolTokens = await this.vaultService.getPoolTokens(poolId);

    const principalsIndex = poolTokens.tokens.findIndex(poolTokenAddress => principalsAddress === poolTokenAddress);
    const poolPrincipalsBalance = poolTokens.balances[principalsIndex];
    const yieldsIndex = poolTokens.tokens.findIndex(poolTokenAddress => yieldsAddress === poolTokenAddress);
    const poolYieldsBalance = poolTokens.balances[yieldsIndex];

    const liquidityProvided = poolPrincipalsBalance.sub(swapFees);

    const poolAPRFees = div18f(swapFees, liquidityProvided);

    const principalsInRatio = div18f(poolPrincipalsBalance, poolYieldsBalance);

    const [tempusPoolStartTime, tempusPoolMaturityTime] = await Promise.all([
      this.tempusPoolService.getStartTime(tempusPool),
      this.tempusPoolService.getMaturityTime(tempusPool),
    ]);

    const poolDuration = (tempusPoolMaturityTime.getTime() - tempusPoolStartTime.getTime()) / 1000;

    const scaleFactor = ethers.utils.parseEther(((SECONDS_IN_A_DAY * DAYS_IN_A_YEAR) / poolDuration).toString());

    const fee = mul18f(poolAPRFees, principalsInRatio);

    const feeScaled = mul18f(fee, scaleFactor);

    debugger;
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
