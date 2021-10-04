import { BigNumber, Contract, ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { TempusAMM } from '../abi/TempusAMM';
import TempusAMMABI from '../abi/TempusAMM.json';
import { DAYS_IN_A_YEAR, SECONDS_IN_A_DAY } from '../constants';
import { mul18f, div18f } from '../utils/wei-math';
import getConfig from '../utils/get-config';
import TempusPoolService from './TempusPoolService';
import getVaultService from './getVaultService';

interface TempusPoolAddressData {
  poolAddress: string;
  tempusPoolId: string;
}

type TempusAMMServiceParameters = {
  Contract: typeof Contract;
  tempusAMMAddresses: string[];
  TempusAMMABI: typeof TempusAMMABI;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
  tempusPoolService: TempusPoolService;
};

class TempusAMMService {
  private tempusAMMMap: Map<string, TempusAMM> = new Map<string, TempusAMM>();
  private tempusPoolService: TempusPoolService | null = null;

  public init({ tempusAMMAddresses, signerOrProvider, tempusPoolService }: TempusAMMServiceParameters) {
    this.tempusAMMMap.clear();

    tempusAMMAddresses.forEach((address: string) => {
      this.tempusAMMMap.set(address, new Contract(address, TempusAMMABI, signerOrProvider) as TempusAMM);
    });

    this.tempusPoolService = tempusPoolService;
  }

  public poolId(address: string): Promise<string> {
    const amm = this.tempusAMMMap.get(address);
    if (amm) {
      try {
        return amm.getPoolId();
      } catch (error) {
        console.error('TempusAMMService - poolId() - Failed to fetch pool ID from contract!', error);
        return Promise.reject(error);
      }
    }

    throw new Error(`TempusAMMService - poolId('${address}') - Invalid AMM address provided!`);
  }

  public async getTempusPoolAddressFromId(poolId: string): Promise<string> {
    const addressDataFetchPromises: Promise<TempusPoolAddressData>[] = [];
    this.tempusAMMMap.forEach(tempusAMM => {
      addressDataFetchPromises.push(this.fetchTempusPoolAddressData(tempusAMM));
    });
    let addressData: TempusPoolAddressData[];
    try {
      addressData = await Promise.all(addressDataFetchPromises);
    } catch (error) {
      console.error(
        'TempusAMMService - getTempusPoolAddressFromId() - Failed to get address data for tempus pools!',
        error,
      );
      return Promise.reject(error);
    }

    for (let i = 0; i < addressData.length; i++) {
      if (addressData[i].tempusPoolId === poolId) {
        return addressData[i].poolAddress;
      }
    }

    throw new Error('Failed to get tempus pool address from ID!');
  }

  public async getTempusPoolAddress(address: string): Promise<string> {
    const service = this.tempusAMMMap.get(address);
    if (service) {
      try {
        return await service.tempusPool();
      } catch (error) {
        console.error('TempusAMMService - getTempusPoolAddress() - Failed to get tempus pool address!', error);
        return Promise.reject(error);
      }
    }
    throw new Error(`TempusAMMService - getTempusPoolAddress() - TempusAMM with address '${address}' does not exist`);
  }

  public async getFixedAPR(address: string, principalsAddress: string): Promise<number | null> {
    if (!this.tempusPoolService) {
      console.error('TempusAMMService - getFixedAPR() - Attempted to se TempusAMMService before initializing it!');
      return Promise.reject();
    }

    // If we try to inject vault service in AMM it create infinite dependency loop - this is a quick workaround.
    const vaultService = getVaultService();

    const service = this.tempusAMMMap.get(address);
    if (service) {
      const YIELD_TO_PRINCIPAL = true;

      const tempusPool = getConfig().tempusPools.find(pool => pool.ammAddress === address);
      if (!tempusPool) {
        console.error('TempusAMMService - getFixedAPR() - Failed to get tempus pool data from AMM!');
        return Promise.reject();
      }

      let poolPrincipalsBalance: BigNumber;
      try {
        const poolId = await service.getPoolId();
        const poolTokens = await vaultService.getPoolTokens(poolId);

        const principalsIndex = poolTokens.tokens.findIndex(poolTokenAddress => principalsAddress === poolTokenAddress);
        poolPrincipalsBalance = poolTokens.balances[principalsIndex];

        if (poolTokens.balances[0].isZero() || poolTokens.balances[1].isZero()) {
          return null;
        }
      } catch (error) {
        console.error('TempusAMMService - getFixedAPR() - Failed to fetch pool balances!', error);
        return Promise.reject(error);
      }

      const spotPrice = poolPrincipalsBalance.div(BigNumber.from('100'));

      let expectedReturn: BigNumber;
      try {
        expectedReturn = await service.getExpectedReturnGivenIn(spotPrice, YIELD_TO_PRINCIPAL);
      } catch (error) {
        console.error('TempusAMMService - getFixedAPR() - Failed to get expected return for yield share tokens!');
        return null;
      }

      let tempusPoolAddress: string;
      try {
        tempusPoolAddress = await this.getTempusPoolAddress(address);
      } catch (error) {
        console.error('TempusAMMService - getFixedAPR() - Failed to fetch tempus pool address!');
        return Promise.reject(error);
      }

      let tempusPoolStartTime: Date;
      let tempusPoolMaturityTime: Date;
      try {
        [tempusPoolStartTime, tempusPoolMaturityTime] = await Promise.all([
          this.tempusPoolService.getStartTime(tempusPoolAddress),
          this.tempusPoolService.getMaturityTime(tempusPoolAddress),
        ]);
      } catch (error) {
        console.error('TempusAMMService - getFixedAPR() - Failed to fetch tempus pool maturity and start time.');
        return Promise.reject(error);
      }

      // Convert poolDuration from milliseconds to seconds.
      const poolDuration = (tempusPoolMaturityTime.getTime() - tempusPoolStartTime.getTime()) / 1000;

      const scaleFactor = ethers.utils.parseEther(((SECONDS_IN_A_DAY * DAYS_IN_A_YEAR) / poolDuration).toString());

      return Number(ethers.utils.formatEther(mul18f(div18f(expectedReturn, spotPrice), scaleFactor)));
    }
    throw new Error(`TempusAMMService - getFixedAPR() - TempusAMM with address '${address}' does not exist`);
  }

  public async getExpectedTokensOutGivenBPTIn(
    address: string,
    lpTokenAmount: BigNumber,
  ): Promise<{
    principals: BigNumber;
    yields: BigNumber;
  }> {
    const tempusAMM = this.tempusAMMMap.get(address);
    if (tempusAMM) {
      try {
        return await tempusAMM.getExpectedTokensOutGivenBPTIn(lpTokenAmount);
      } catch (error) {
        console.error(
          'TempusAMMService - getExpectedTokensOutGivenBPTIn() - Failed to fetch expected amount of Principals and Yields!',
        );
      }
    }
    throw new Error(
      `TempusAMMService - getExpectedTokensOutGivenBPTIn() - TempusAMM with address '${address}' does not exist!`,
    );
  }

  async getExpectedLPTokensForTokensIn(
    address: string,
    principalsAddress: string,
    yieldsAddress: string,
    principalsIn: BigNumber,
    yieldsIn: BigNumber,
  ): Promise<BigNumber> {
    const tempusAMM = this.tempusAMMMap.get(address);
    if (tempusAMM) {
      if (principalsIn.isZero() && yieldsIn.isZero()) {
        return ethers.utils.parseEther('0');
      }

      try {
        const assets = [
          { address: principalsAddress, amount: principalsIn },
          { address: yieldsAddress, amount: yieldsIn },
        ].sort((a, b) => parseInt(a.address) - parseInt(b.address));
        const amountsIn = assets.map(({ amount }) => amount);

        return await tempusAMM.getExpectedLPTokensForTokensIn(amountsIn);
      } catch (error) {
        console.error(
          'TempusAMMService - getExpectedLPTokensForTokensIn() - Failed to fetch expected amount of LP Tokens!',
        );
        return Promise.reject(error);
      }
    }
    throw new Error(
      `TempusAMMService - getExpectedLPTokensForTokensIn() - TempusAMM with address '${address}' does not exist!`,
    );
  }

  private async fetchTempusPoolAddressData(tempusAMM: TempusAMM): Promise<TempusPoolAddressData> {
    const [poolAddress, tempusPoolId] = await Promise.all([tempusAMM.tempusPool(), tempusAMM.getPoolId()]);

    return {
      poolAddress,
      tempusPoolId,
    };
  }

  async getExpectedReturnGivenIn(address: string, amount: BigNumber, yieldShareIn: boolean) {
    const contract = this.tempusAMMMap.get(address);
    if (contract) {
      try {
        return await contract.getExpectedReturnGivenIn(amount, yieldShareIn);
      } catch (error) {
        console.error(
          'TempusAMMService - getExpectedReturnGivenIn() - Failed to get expected return value for token!',
          error,
        );
        return Promise.reject(error);
      }
    }
    throw new Error(
      `TempusAMMService - getExpectedReturnGivenIn() - TempusAMM with address '${address}' does not exist!`,
    );
  }

  async getSwapFeePercentage(address: string): Promise<BigNumber> {
    const contract = this.tempusAMMMap.get(address);
    if (contract) {
      try {
        return await contract.getSwapFeePercentage();
      } catch (error) {
        console.error('TempusAMMService - getSwapFeePercentage() - Failed to get swap fees', error);
        return Promise.reject(error);
      }
    }
    throw new Error(`TempusAMMService - getSwapFeePercentage() - TempusAMM with address '${address}' does not exist!`);
  }
}

export default TempusAMMService;
