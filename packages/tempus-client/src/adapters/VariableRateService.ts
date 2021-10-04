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
} from '../constants';
import TempusPoolService from '../services/TempusPoolService';
import { ProtocolName } from '../interfaces';
import { wadToDai } from '../utils/rayToDai';
import getConfig from '../utils/get-config';

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
  private tokenAddressToContractMap: { [tokenAddress: string]: ethers.Contract } = {};
  private signerOrProvider: JsonRpcSigner | JsonRpcProvider | null = null;

  init(signerOrProvider: JsonRpcSigner | JsonRpcProvider, tempusPoolService: TempusPoolService) {
    if (signerOrProvider) {
      this.aaveLendingPool = new Contract(aaveLendingPoolAddress, AaveLendingPoolABI, signerOrProvider);
      this.lidoOracle = new Contract(getConfig().lidoOracle, lidoOracleABI.abi, signerOrProvider);
      this.signerOrProvider = signerOrProvider;
      this.tempusPoolService = tempusPoolService;
    }
  }

  async getAprRate(protocol: ProtocolName, tempusPoolAddress?: string): Promise<number> {
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
        return this.getLidoAPR(fees);
      }

      default: {
        return 0;
      }
    }
  }

  private async getLidoAPR(fees: number): Promise<number> {
    try {
      const { postTotalPooledEther, preTotalPooledEther, timeElapsed } =
        await this.lidoOracle?.getLastCompletedReportDelta();
      const apr = this.calculateLidoAPR(postTotalPooledEther, preTotalPooledEther, timeElapsed);
      const aprPlusFees = this.calculateLidoFees(apr, fees);
      return Number(ethers.utils.formatEther(aprPlusFees));
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

  private calculateLidoFees(APR: BigNumber, fees: number): BigNumber {
    let normalizedFees: number = fees;
    if (fees < 0) {
      normalizedFees = 0;
    }

    if (fees > 1) {
      normalizedFees = 1;
    }

    const numerator = String((1 - normalizedFees) * 10000);
    const denominator = String(10000);

    return APR.mul(BigNumber.from(numerator)).div(BigNumber.from(denominator));
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
