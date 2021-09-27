import { ethers, BigNumber, Contract } from 'ethers';
import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import lidoOracleABI from '../abi/LidoOracle.json';
import AaveLendingPoolABI from '../abi/AaveLendingPool.json';
import cEthTokenABI from '../abi/cEthToken.json';
import {
  DAYS_IN_A_YEAR,
  SECONDS_IN_YEAR,
  ONE_ETH_IN_WEI,
  aaveLendingPoolAddress,
  lidoOracleAddress,
  cEthAddress,
  daiAddress,
  COMPOUND_BLOCKS_PER_DAY,
} from '../constants';
import { ProtocolName } from '../interfaces';
import { wadToDai } from '../utils/rayToDai';

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
  private cEthToken: Contract | null = null;

  init(signerOrProvider: JsonRpcSigner | JsonRpcProvider) {
    if (signerOrProvider) {
      this.aaveLendingPool = new Contract(aaveLendingPoolAddress, AaveLendingPoolABI, signerOrProvider);
      this.lidoOracle = new Contract(lidoOracleAddress, lidoOracleABI.abi, signerOrProvider);
      this.cEthToken = new Contract(cEthAddress, cEthTokenABI, signerOrProvider);
    }
  }

  async getAprRate(protocol: ProtocolName): Promise<number> {
    switch (protocol) {
      case 'aave': {
        return VariableRateService.getAprFromApy(await this.getAaveAPY());
      }

      // case 'compound': {
      //   return VariableRateService.getAprFromApy(await this.getCompoundAPY());
      // }

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

  private async getAaveAPY(): Promise<number> {
    try {
      const { currentLiquidityRate } = await this.aaveLendingPool?.getReserveData(daiAddress);
      const aaveAPY = Number(ethers.utils.formatEther(wadToDai(currentLiquidityRate)));
      return aaveAPY;
    } catch (error) {
      console.error('VariableRateService - getAaveAPR', error);
      return 0;
    }
  }

  // private async getCompoundAPY(): Promise<number> {
  //   try {
  //     const supplyRatePerBlock = await this.cEthToken?.methods.supplyRatePerBlock().call();
  //     const supplyApy =
  //       (Math.pow((supplyRatePerBlock / ethMantissa) * COMPOUND_BLOCKS_PER_DAY + 1, DAYS_IN_A_YEAR) - 1) * 100;

  //     console.log('getCompoundAPY supplyRatePerBlock', supplyRatePerBlock);
  //     console.log('getCompoundAPY supplyApy', supplyApy);

  //     // TODO check with actual contract
  //     return supplyApy;
  //   } catch (error) {
  //     console.error('VariableRateService - getCompoundAPY', error);
  //     return 0;
  //   }
  // }
}

export default VariableRateService;
