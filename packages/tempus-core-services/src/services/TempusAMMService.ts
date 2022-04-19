import { BigNumber, Contract, ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import TempusAMMABI, { TempusAMM } from '../abi/TempusAMM';
import { Chain, ChainConfig } from '../interfaces';

type TempusAMMServiceParameters = {
  Contract: typeof Contract;
  tempusAMMAddresses: string[];
  TempusAMMABI: typeof TempusAMMABI;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
  chain: Chain;
  getChainConfig: (chain: Chain) => ChainConfig;
};

export class TempusAMMService {
  private tempusAMMMap: Map<string, TempusAMM> = new Map<string, TempusAMM>();

  private chain: Chain | null = null;

  private config: ChainConfig | null = null;

  public init({ tempusAMMAddresses, signerOrProvider, chain, getChainConfig }: TempusAMMServiceParameters): void {
    this.tempusAMMMap.clear();

    tempusAMMAddresses.forEach((address: string) => {
      try {
        this.tempusAMMMap.set(address, new Contract(address, TempusAMMABI, signerOrProvider) as TempusAMM);
      } catch (error) {
        console.error('TempusAMMService - init - error setting contract', error);
      }
    });

    this.chain = chain;
    this.config = getChainConfig(this.chain);
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

  getTempusPoolAddressFromId(poolId: string): string {
    if (!this.config) {
      throw new Error(
        'TempusAMMService - getTempusPoolAddressFromId() - Attempted to se TempusAMMService before initializing it!',
      );
    }

    const poolConfig = this.config.tempusPools.find(pool => pool.poolId === poolId);
    if (!poolConfig) {
      throw new Error(`Failed to find tempus pool config for pool with ${poolId} PoolID`);
    }

    return poolConfig.address;
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
        return ethers.utils.parseUnits('0');
      }

      try {
        const assets = [
          { address: principalsAddress, amount: principalsIn },
          { address: yieldsAddress, amount: yieldsIn },
        ].sort((a, b) => parseInt(a.address, 10) - parseInt(b.address, 10));
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

  async getExpectedReturnGivenIn(address: string, amount: BigNumber, yieldShareIn: boolean): Promise<BigNumber> {
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

  static getMaxLeftoverShares(
    principalsToWithdraw: BigNumber,
    yieldsToWithdraw: BigNumber,
    lpTokensToWithdraw: BigNumber,
  ): BigNumber {
    return principalsToWithdraw.add(yieldsToWithdraw).add(lpTokensToWithdraw).div(BigNumber.from('1000'));
  }
}
