import Axios from 'axios';
import { formatEther } from 'ethers/lib/utils';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';

import TempusPoolABI from '../abi/TempusPool/TempusPool.json';
import { TempusPool } from '../abi/TempusPool/TempusPool';
import ERC20ABI from '../abi/ERC20/ERC20.json';
import { ERC20 } from '../abi/ERC20/ERC20';

import config from '../config';

let contractService: ContractService;
const getContractService = () => {
  if (!contractService) {
    contractService = new ContractService();
  }
  return contractService;
};
export default getContractService;

class ContractService {
  private signer: JsonRpcSigner | undefined = undefined;
  private provider: JsonRpcProvider;

  private tempusPoolContracts: TempusPool[] = [];

  constructor() {
    this.provider = new JsonRpcProvider('http://127.0.0.1:8545', { chainId: 31337, name: 'unknown' });

    config.protocols.forEach(protocol => {
      const tempusPoolContract = new Contract(protocol.address, TempusPoolABI, this.provider) as TempusPool;

      this.tempusPoolContracts.push(tempusPoolContract);
    });
  }

  /**
   * When user connects wallet we need to initialize all required contract with user wallet as a signer.
   * List of tempus pools is currently stored in a config file - ideally we will be able to fetch this list from contract.
   *
   * @param signer Signer that's provided when user connects the wallet to the app. We currently support MetaMask only.
   */
  public init(signer: JsonRpcSigner) {
    this.signer = signer;

    this.tempusPoolContracts = [];

    config.protocols.forEach(protocol => {
      const tempusPoolContract = new Contract(protocol.address, TempusPoolABI, signer) as TempusPool;

      this.tempusPoolContracts.push(tempusPoolContract);
    });
  }

  /**
   * Returns total value locked for a tempus pool in USD.
   *
   * @param address Address of the tempus pool contract you want to get TVL for.
   */
  public async getPoolTVL(address: string) {
    const ybt = await this.getTempusPoolYieldBearingToken(address);
    if (ybt) {
      const ybtContract = this.getContractForToken(ybt);

      const yieldTokenName = await ybtContract.name();
      const totalYieldSupply = formatEther(await ybtContract.balanceOf(address));

      const yieldTokenId = config.tokenNameToIdMap[yieldTokenName];

      const response = await Axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: yieldTokenId,
          vs_currencies: 'usd',
        },
      });

      return response.data[yieldTokenId].usd * Number(totalYieldSupply);
    }
  }

  private async getTempusPoolYieldBearingToken(address: string) {
    const pool = this.getTempusPoolContract(address);

    return await pool?.yieldBearingToken();
  }

  private getTempusPoolContract(address: string) {
    return this.tempusPoolContracts.find(entry => {
      return entry.address === address;
    });
  }

  private getContractForToken(address: string) {
    return new Contract(address, ERC20ABI, this.provider) as ERC20;
  }
}
