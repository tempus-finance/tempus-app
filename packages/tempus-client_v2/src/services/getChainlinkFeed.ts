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
  },
};

const getChainlinkFeed = (chain: Chain, tokenA: Ticker): string => chainlinkMap[chain][`${tokenA.toLowerCase()}-usd`];

export default getChainlinkFeed;
