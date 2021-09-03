import { BigNumber, Contract, ethers } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { TempusAMM } from '../abi/TempusAMM';
import TempusAMMABI from '../abi/TempusAMM.json';
import { DAYS_IN_A_YEAR, SECONDS_IN_A_DAY } from '../constants';
import TempusPoolService from './TempusPoolService';
import { poolAddressCache, poolIdCache } from '../cache/TempusAMMCache';

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

  public init(params: TempusAMMServiceParameters) {
    this.tempusAMMMap.clear();

    params.tempusAMMAddresses.forEach((address: string) => {
      this.tempusAMMMap.set(address, new Contract(address, TempusAMMABI, params.signerOrProvider) as TempusAMM);
    });

    this.tempusPoolService = params.tempusPoolService;
  }

  public poolId(address: string): Promise<string> {
    const amm = this.tempusAMMMap.get(address);
    if (amm) {
      const cachedPoolIdPromise = poolIdCache.get(address);
      if (cachedPoolIdPromise) {
        return cachedPoolIdPromise;
      }

      try {
        const poolIdFetchPromise = amm.getPoolId();
        poolIdCache.set(address, poolIdFetchPromise);

        return poolIdFetchPromise;
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
      const cachedPoolAddressPromise = poolAddressCache.get(address);
      if (cachedPoolAddressPromise) {
        return cachedPoolAddressPromise;
      }

      try {
        const poolAddressFetchPromise = service.tempusPool();
        poolAddressCache.set(address, poolAddressFetchPromise);

        return poolAddressFetchPromise;
      } catch (error) {
        console.error('TempusAMMService - getTempusPoolAddress() - Failed to get tempus pool address!', error);
        return Promise.reject(error);
      }
    }
    throw new Error(`TempusAMMService - getTempusPoolAddress() - TempusAMM with address '${address}' does not exist`);
  }

  public async getFixedAPR(address: string): Promise<number> {
    if (!this.tempusPoolService) {
      console.error('TempusAMMService - getFixedAPR() - Attempted to se TempusAMMService before initializing it!');
      return Promise.reject();
    }

    const service = this.tempusAMMMap.get(address);
    if (service) {
      const SPOT_PRICE_AMOUNT = 10000;

      let expectedReturn: BigNumber;
      try {
        expectedReturn = await service.getExpectedReturnGivenIn(
          ethers.utils.parseEther(SPOT_PRICE_AMOUNT.toString()),
          false,
        );
      } catch (error) {
        console.error(
          'TempusAMMService - getExpectedReturnGivenIn() - Failed to get expected return for yield share tokens!',
        );
        return Promise.reject(error);
      }

      let tempusPoolAddress: string;
      try {
        tempusPoolAddress = await this.getTempusPoolAddress(address);
      } catch (error) {
        console.error('TempusAMMService - getFixedAPR() - Failed to fetch tempus pool address!');
        return Promise.reject(error);
      }

      let tempusPoolMaturityTime: Date;
      try {
        tempusPoolMaturityTime = await this.tempusPoolService.getMaturityTime(tempusPoolAddress);
      } catch (error) {
        console.error('TempusAMMService - getFixedAPR() - Failed to fetch tempus pool maturity time.');
        return Promise.reject(error);
      }

      // Convert timeUntilMaturity from milliseconds to seconds.
      const timeUntilMaturity = (tempusPoolMaturityTime.getTime() - Date.now()) / 1000;

      const scaleFactor = (SECONDS_IN_A_DAY * DAYS_IN_A_YEAR) / timeUntilMaturity;

      return (Number(ethers.utils.formatEther(expectedReturn)) / SPOT_PRICE_AMOUNT) * scaleFactor;
    }
    throw new Error(
      `TempusAMMService - getExpectedReturnGivenIn() - TempusAMM with address '${address}' does not exist`,
    );
  }

  private async fetchTempusPoolAddressData(tempusAMM: TempusAMM): Promise<TempusPoolAddressData> {
    const [poolAddress, tempusPoolId] = await Promise.all([tempusAMM.tempusPool(), tempusAMM.getPoolId()]);

    return {
      poolAddress,
      tempusPoolId,
    };
  }
}

export default TempusAMMService;
