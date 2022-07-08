import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber, ethers } from 'ethers';
import Axios from 'axios';
import { Pool, Position } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { abi as UniswapPoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import {
  ERC20ABI,
  VaultABI,
  StatsABI,
  ERC20,
  Vault,
  Stats,
  Chain,
  Ticker,
  Decimal,
  tokenPrecision,
  DEFAULT_DECIMAL_PRECISION,
  ZERO,
} from 'tempus-core-services';
import {
  balancerPoolAddress,
  balancerPoolId,
  balancerVaultAddress,
  wEthAddress,
  tempTokenAddress,
  treasuryAddress,
  uniswapPoolAddress,
  usdcAddress,
  spookySwapPoolAddress,
  TEMP_PRECISION,
  USDC_PRECISION,
} from '../constants';
import config from '../config';
import BalancerPoolABI from '../abi/BalancerPoolABI.json';
import UniswapPositionManagerABI from '../abi/UniswapPositionManagerABI.json';
import SpookySwapABI from '../abi/SpookySwapABI.json';

export interface TreasuryValues {
  tempToken: Decimal;
  tempusPools: Decimal;
  balancerPool: Decimal;
  uniswapPool: Decimal;
  spookySwapPool: Decimal;
}

// TODO - Refactor/move into tempus-core-services
class TreasuryValueService {
  async getValuesPerSource(): Promise<TreasuryValues> {
    const [tempTokenValue, tempusPoolsValue, balancerPoolValue, uniswapPoolValue, spookySwapPoolValue] =
      await Promise.all([
        this.getTempTokenValue(),
        this.getTempusPoolsValue(),
        this.getBalancerPoolValue(),
        this.getUniswapPoolValue(),
        this.getSpookySwapLPTempValue(),
      ]);

    return {
      tempToken: tempTokenValue,
      tempusPools: tempusPoolsValue,
      balancerPool: balancerPoolValue,
      uniswapPool: uniswapPoolValue,
      spookySwapPool: spookySwapPoolValue,
    };
  }

  async getValue(): Promise<Decimal> {
    const valuesPerSource = await this.getValuesPerSource();
    return Object.values(valuesPerSource).reduce((sum, value) => sum.add(value), ZERO);
  }

  /**
   * Calculates TEMP token value in USD for all Tempus Treasuries (each chain has one Treasury).
   */
  private async getTempTokenValue(): Promise<Decimal> {
    const tokenPrice = await this.getTempTokenPrice();

    const results = await Promise.all(
      Object.keys(config).map(async key => {
        const chain = key as Chain;

        // Skip test chains
        if (config[chain].testChain) {
          return new Decimal(0);
        }

        const tokenContract = await this.getTokenContract(chain, config[chain].tempTokenAddress);

        const tokenBalance = await tokenContract.balanceOf(config[chain].tempusTreasuryAddress);

        const tokenBalanceDecimal = new Decimal(ethers.utils.formatUnits(tokenBalance, TEMP_PRECISION));

        return tokenBalanceDecimal.mul(tokenPrice);
      }),
    );

    let totalValue = new Decimal(0);
    results.forEach(result => {
      totalValue = totalValue.add(result);
    });

    return totalValue;
  }

  /**
   * Calculates USD value (TVL) of all Tempus Pool across all chains.
   */
  private async getTempusPoolsValue() {
    const chainValues = await Promise.all(
      Object.keys(config).map(async (key: string) => {
        const chain = key as Chain;

        // Skip test chains
        if (config[chain].testChain) {
          return new Decimal(0);
        }

        const statsContract = await this.getStatsContract(chain);

        const tempusPoolsValue = await Promise.all(
          config[chain].tempusPools.map(async tempusPoolConfig => {
            const principalsContract = await this.getTokenContract(chain, tempusPoolConfig.principalsAddress);
            const yieldsContract = await this.getTokenContract(chain, tempusPoolConfig.yieldsAddress);
            const lpContract = await this.getTokenContract(chain, tempusPoolConfig.ammAddress);

            const [principalsBalance, yieldsBalance, lpTokenBalance, backingTokenRate] = await Promise.all([
              principalsContract.balanceOf(config[chain].tempusTreasuryAddress),
              yieldsContract.balanceOf(config[chain].tempusTreasuryAddress),
              lpContract.balanceOf(config[chain].tempusTreasuryAddress),
              this.getTokenRateToUSD(chain, tempusPoolConfig.backingToken),
            ]);

            const principalsBalanceDecimal = new Decimal(
              ethers.utils.formatUnits(principalsBalance, tempusPoolConfig.tokenPrecision.principals),
            );
            const yieldsBalanceDecimal = new Decimal(
              ethers.utils.formatUnits(yieldsBalance, tempusPoolConfig.tokenPrecision.yields),
            );
            const lpBalanceDecimal = new Decimal(
              ethers.utils.formatUnits(lpTokenBalance, tempusPoolConfig.tokenPrecision.lpTokens),
            );

            const maxLeftoverShares = principalsBalanceDecimal
              .add(yieldsBalanceDecimal)
              .add(lpBalanceDecimal)
              .div(new Decimal(1000));

            const exitEstimate = await statsContract.estimateExitAndRedeem(
              tempusPoolConfig.ammAddress,
              lpTokenBalance,
              principalsBalance,
              yieldsBalance,
              maxLeftoverShares.toBigNumber(tempusPoolConfig.tokenPrecision.principals),
              true,
            );

            const tokenAmountDecimal = new Decimal(
              ethers.utils.formatUnits(exitEstimate.tokenAmount, tempusPoolConfig.tokenPrecision.backingToken),
            );

            return tokenAmountDecimal.mul(backingTokenRate);
          }),
        );

        let totalValue = new Decimal(0);
        tempusPoolsValue.forEach(tempusPoolValue => {
          totalValue = totalValue.add(tempusPoolValue);
        });

        return totalValue;
      }),
    );

    let totalValue = new Decimal(0);
    chainValues.forEach(chainValue => {
      totalValue = totalValue.add(chainValue);
    });

    return totalValue;
  }

  private async getBalancerPoolValue() {
    const balancerVaultContract = await this.getBalancerVaultContract('ethereum');
    const balancerPoolContract = await this.getBalancerPoolContract('ethereum');

    const lpTokenBalance = await balancerPoolContract.balanceOf(treasuryAddress);
    const lpTokenTotalSupply = await balancerPoolContract.totalSupply();

    const tempTokenInfo = await balancerVaultContract.getPoolTokenInfo(balancerPoolId, tempTokenAddress);
    const ethTokenInfo = await balancerVaultContract.getPoolTokenInfo(balancerPoolId, wEthAddress);

    const tempTokenAmount = lpTokenBalance.mul(tempTokenInfo.cash).div(lpTokenTotalSupply);
    const ethTokenAmount = lpTokenBalance.mul(ethTokenInfo.cash).div(lpTokenTotalSupply);

    const tempTokenAmountDecimal = new Decimal(ethers.utils.formatUnits(tempTokenAmount, TEMP_PRECISION));
    const ethTokenAmountDecimal = new Decimal(ethers.utils.formatUnits(ethTokenAmount, DEFAULT_DECIMAL_PRECISION));

    const [tempPrice, ethPrice] = await Promise.all([
      this.getTempTokenPrice(),
      this.getTokenRateToUSD('ethereum', 'ETH'),
    ]);

    const tempValue = tempPrice.mul(tempTokenAmountDecimal);
    const ethValue = ethPrice.mul(ethTokenAmountDecimal);

    return tempValue.add(ethValue);
  }

  private async getUniswapPoolState() {
    const uniswapPoolContract = await this.getUniswapPoolContract('ethereum');

    const [liquidity, slot] = await Promise.all([uniswapPoolContract.liquidity(), uniswapPoolContract.slot0()]);

    return {
      liquidity,
      sqrtPriceX96: slot[0],
      tick: slot[1],
      observationIndex: slot[2],
      observationCardinality: slot[3],
      observationCardinalityNext: slot[4],
      feeProtocol: slot[5],
      unlocked: slot[6],
    };
  }

  private async getUniswapPoolValue() {
    const state = await this.getUniswapPoolState();

    const TokenA = new Token(1, usdcAddress, USDC_PRECISION, 'USDC', 'USD Coin');
    const TokenB = new Token(1, tempTokenAddress, TEMP_PRECISION, 'TEMP', 'Tempus');

    const pool = new Pool(
      TokenA,
      TokenB,
      10000, /// fee
      state.sqrtPriceX96.toString(),
      state.liquidity.toString(),
      state.tick,
    );

    const uniswapPositionManagerContract = await this.getUniswapPositionManagerContract('ethereum');

    const positionsBalance = await uniswapPositionManagerContract.balanceOf(treasuryAddress);

    const positions = (
      await Promise.all(
        Array.from(Array(positionsBalance.toNumber())).map(async (_, positionIndex) => {
          const positionId = await uniswapPositionManagerContract.tokenOfOwnerByIndex(treasuryAddress, positionIndex);
          const position = await uniswapPositionManagerContract.positions(positionId);

          if (
            position.token0.toLowerCase() !== TokenA.address.toLowerCase() ||
            position.token1.toLowerCase() !== TokenB.address.toLowerCase()
          ) {
            return null;
          }
          return new Position({
            pool,
            liquidity: position.liquidity.toString(),
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
          });
        }),
      )
    ).filter(position => position !== null);

    const tempAmount = positions.reduce((totalValue, currPositionValue) => {
      if (!currPositionValue) {
        return totalValue;
      }

      return totalValue.add(currPositionValue.amount1.quotient.toString());
    }, BigNumber.from(0));
    const tempAmountDecimal = new Decimal(ethers.utils.formatUnits(tempAmount, TEMP_PRECISION));

    const usdcAmount = positions.reduce((totalValue, currPositionValue) => {
      if (!currPositionValue) {
        return totalValue;
      }

      return totalValue.add(currPositionValue.amount0.quotient.toString());
    }, BigNumber.from(0));
    const usdcAmountDecimal = new Decimal(ethers.utils.formatUnits(usdcAmount, USDC_PRECISION));

    const tempTokenPrice = await this.getTempTokenPrice();

    const tempValue = tempAmountDecimal.mul(tempTokenPrice);

    return tempValue.add(usdcAmountDecimal);
  }

  private async getSpookySwapLPTempValue() {
    const spookySwapPoolContract = await this.getSpookySwapPoolContract('fantom');

    const treasuryTokenBalance = await spookySwapPoolContract.balanceOf(config.fantom.tempusTreasuryAddress);
    const tokenTotalSupply = await spookySwapPoolContract.totalSupply();

    const fantomTempTokenContract = await this.getTokenContract('fantom', config.fantom.tempTokenAddress);

    const poolTempBalance = await fantomTempTokenContract.balanceOf(spookySwapPoolContract.address);

    const valueInTemp = treasuryTokenBalance.mul(poolTempBalance).div(tokenTotalSupply);

    const valueInTempDecimal = new Decimal(ethers.utils.formatUnits(valueInTemp, TEMP_PRECISION));

    const tempTokenPrice = await this.getTempTokenPrice();

    return valueInTempDecimal.mul(tempTokenPrice);
  }

  // eslint-disable-next-line class-methods-use-this
  private async getTempTokenPrice() {
    const result = await Axios.get<any>('https://api.coingecko.com/api/v3/simple/price?ids=tempus&vs_currencies=usd');

    return new Decimal(result.data.tempus.usd.toString());
  }

  private async getTokenRateToUSD(chain: Chain, token: Ticker) {
    const chainlinkMap: { [key in Chain]: { [pair: string]: string } } = {
      ethereum: {
        'eth-usd': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        'usdc-usd': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
        'dai-usd': '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
      },
      fantom: {
        'dai-usd': '0x91d5DEFAFfE2854C7D02F50c80FA1fdc8A721e52',
        'usdc-usd': '0x2553f4eeb82d5A26427b8d1106C51499CBa5D99c',
        'fusdt-usd': '0x2553f4eeb82d5A26427b8d1106C51499CBa5D99c', // same as 'usdc-usd'
        'yfi-usd': '0x9B25eC3d6acfF665DfbbFD68B3C1D896E067F0ae',
        'usdt-usd': '0xF64b636c5dFe1d3555A847341cDC449f612307d0',
        'ftm-usd': '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
        'weth-usd': '0x11DdD3d147E5b83D01cee7070027092397d63658',
        'wbtc-usd': '0x8e94C22142F4A64b99022ccDd994f4e9EC86E4B4',
      },
      'ethereum-fork': {
        'eth-usd': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        'usdc-usd': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
        'dai-usd': '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
      },
      unsupported: {},
    };

    const getChainlinkFeed = (tokenA: Ticker): string => chainlinkMap[chain][`${tokenA.toLowerCase()}-usd`];

    const statisticsContract = await this.getStatsContract(chain);

    const chainLinkAggregator = getChainlinkFeed(token);

    const [rate, rateDenominator] = await statisticsContract.getRate(chainLinkAggregator);

    const precision = tokenPrecision[token] || DEFAULT_DECIMAL_PRECISION;

    return new Decimal(rate, precision).div(new Decimal(rateDenominator, precision));
  }

  private async getStatsContract(chain: Chain) {
    const provider = await this.getProvider(chain);

    return new ethers.Contract(config[chain].statisticsContract, StatsABI, provider) as Stats;
  }

  private async getBalancerVaultContract(chain: Chain) {
    const provider = await this.getProvider(chain);

    return new ethers.Contract(balancerVaultAddress, VaultABI, provider) as Vault;
  }

  private async getSpookySwapPoolContract(chain: Chain) {
    const provider = await this.getProvider(chain);

    return new ethers.Contract(spookySwapPoolAddress, SpookySwapABI, provider);
  }

  private async getBalancerPoolContract(chain: Chain) {
    const provider = await this.getProvider(chain);

    return new ethers.Contract(balancerPoolAddress, BalancerPoolABI, provider);
  }

  private async getUniswapPoolContract(chain: Chain) {
    const provider = await this.getProvider(chain);

    return new ethers.Contract(uniswapPoolAddress, UniswapPoolABI, provider);
  }

  private async getTokenContract(chain: Chain, address: string) {
    const provider = await this.getProvider(chain);

    return new ethers.Contract(address, ERC20ABI, provider) as ERC20;
  }

  private async getUniswapPositionManagerContract(chain: Chain) {
    const provider = await this.getProvider(chain);

    return new ethers.Contract('0xC36442b4a4522E871399CD717aBDD847Ab11FE88', UniswapPositionManagerABI, provider);
  }

  // eslint-disable-next-line class-methods-use-this
  private async getProvider(chain: Chain): Promise<any> {
    if (chain === 'fantom') {
      return new JsonRpcProvider(process.env.REACT_APP_FANTOM_RPC, { chainId: 250, name: 'Fantom Opera' });
    }

    const browserProvider = (window as any).ethereum;

    if (browserProvider && browserProvider.chainId && parseInt(browserProvider.chainId, 16) === 1) {
      return new ethers.providers.Web3Provider(browserProvider, 'any');
    }
    return new JsonRpcProvider(process.env.REACT_APP_ETHEREUM_RPC, { chainId: 1, name: 'homestead' });
  }
}
export default TreasuryValueService;
