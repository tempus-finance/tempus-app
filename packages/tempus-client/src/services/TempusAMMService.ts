import { Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { TempusAMM } from '../abi/TempusAMM';
import TempusAMMABI from '../abi/TempusAMM.json';

interface TempusPoolAddressData {
  poolAddress: string;
  tempusPoolId: string;
}

type TempusAMMServiceParameters = {
  Contract: typeof Contract;
  tempusAMMAddresses: string[];
  TempusAMMABI: typeof TempusAMMABI;
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
};

class TempusAMMService {
  private tempusAMMMap: Map<string, TempusAMM> = new Map<string, TempusAMM>();

  public init(params: TempusAMMServiceParameters) {
    this.tempusAMMMap.clear();

    params.tempusAMMAddresses.forEach((address: string) => {
      this.tempusAMMMap.set(address, new Contract(address, TempusAMMABI, params.signerOrProvider) as TempusAMM);
    });
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

    throw new Error('TempusAMMService - poolId() - Invalid AMM address provided!');
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

  private async fetchTempusPoolAddressData(tempusAMM: TempusAMM): Promise<TempusPoolAddressData> {
    const [poolAddress, tempusPoolId] = await Promise.all([tempusAMM.tempusPool(), tempusAMM.getPoolId()]);

    return {
      poolAddress,
      tempusPoolId,
    };
  }
}

export default TempusAMMService;
