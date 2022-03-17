import { Chain } from '../interfaces/Chain';
import { Ticker } from '../interfaces/Token';

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
};

export const getChainlinkFeed = (chain: Chain, tokenA: Ticker): string =>
  chainlinkMap[chain][`${tokenA.toLowerCase()}-usd`];
