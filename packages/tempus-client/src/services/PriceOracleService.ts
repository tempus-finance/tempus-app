// External libraries
import { CallOverrides, Contract } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';

// Contract Typings
import { AavePriceOracle } from '../abi/AavePriceOracle';

// ABI
import AavePriceOracleABI from '../abi/AavePriceOracle.json';

class PriceOracleService {
  private provider: JsonRpcProvider;
  private contract: AavePriceOracle;

  constructor(address: string) {
    // TODO - Figure out a better way to store read-only provider (maybe as a singleton that can be used across contract services)
    this.provider = new JsonRpcProvider('http://127.0.0.1:8545', { chainId: 31337, name: 'localhost' });
    this.contract = new Contract(address, AavePriceOracleABI, this.provider) as AavePriceOracle;
  }

  public currentRate(yieldBearingTokenAddress: string, overrides?: CallOverrides) {
    try {
      if (!overrides) {
        return this.contract.currentRate(yieldBearingTokenAddress);
      } else {
        return this.contract.currentRate(yieldBearingTokenAddress, overrides);
      }
    } catch (error) {
      console.error('PriceOracleService currentRate', error);
    }
  }
}
export default PriceOracleService;
