// External libraries
import { BigNumber, CallOverrides, Contract } from 'ethers';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';

// Contract Typings
import { AavePriceOracle } from '../abi/AavePriceOracle';
import { CompoundPriceOracle } from '../abi/CompoundPriceOracle';

// ABI
import AavePriceOracleABI from '../abi/AavePriceOracle.json';
import CompoundPriceOracleABI from '../abi/CompoundPriceOracle.json';

// Interfaces
import { PriceOracle } from '../interfaces/PriceOracle';

type PriceOraclesMap = { [address: string]: AavePriceOracle | CompoundPriceOracle };

type PriceOracleServiceParameters = {
  Contract: typeof Contract;
  priceOraclesConfig: PriceOracle[];
  signerOrProvider: JsonRpcSigner | JsonRpcProvider;
};

class PriceOracleService {
  private priceOraclesMap: PriceOraclesMap = {};

  public init(params: PriceOracleServiceParameters) {
    this.priceOraclesMap = {};

    params.priceOraclesConfig.forEach(config => {
      if (config.name === 'aave') {
        this.priceOraclesMap[config.address] = new Contract(
          config.address,
          AavePriceOracleABI,
          params.signerOrProvider,
        ) as AavePriceOracle;
      }
      if (config.name === 'compound') {
        this.priceOraclesMap[config.address] = new Contract(
          config.address,
          CompoundPriceOracleABI,
          params.signerOrProvider,
        ) as CompoundPriceOracle;
      }
    });
  }

  public async currentRate(address: string, tokenAddress: string, overrides?: CallOverrides): Promise<BigNumber> {
    let currentRate = BigNumber.from('0');

    const priceOracle = this.priceOraclesMap[address];
    if (priceOracle) {
      try {
        if (!overrides) {
          currentRate = await priceOracle.currentRate(tokenAddress);
        } else {
          currentRate = await priceOracle.currentRate(tokenAddress, overrides);
        }

        return currentRate;
      } catch (error) {
        console.error('PriceOracleService currentRate', error);
      }
    }

    throw new Error(`PriceOracle address '${address}' is not valid`);
  }
}
export default PriceOracleService;
