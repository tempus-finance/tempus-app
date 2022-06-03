import {
  prettifyChainName,
  prettifyChainNameLong,
  chainToTicker,
  chainNameToHexChainId,
  chainIdToChainName,
  chainIdHexToChainName,
} from './chainUtils';

describe('chainUtil', () => {
  test('prettifyChainName', () => {
    expect(prettifyChainName('ethereum')).toEqual('Ethereum');
    expect(prettifyChainName('fantom')).toEqual('Fantom');
    expect(prettifyChainName('ethereum-fork')).toEqual('Ethereum Fork');
    expect(prettifyChainName('unsupported')).toEqual('Unsupported');
  });

  test('prettifyChainNameLong', () => {
    expect(prettifyChainNameLong('ethereum')).toEqual('Ethereum Mainnet');
    expect(prettifyChainNameLong('fantom')).toEqual('Fantom Opera');
    expect(prettifyChainNameLong('ethereum-fork')).toEqual('Tempus Ethereum Fork');
    expect(prettifyChainNameLong('unsupported')).toEqual('Unsupported Network');
  });

  test('chainToTicker', () => {
    expect(chainToTicker('ethereum')).toEqual('ETH');
    expect(chainToTicker('fantom')).toEqual('FTM');
    expect(chainToTicker('ethereum-fork')).toEqual('ETH');
    expect(chainToTicker('unsupported')).toEqual('');
  });

  test('chainNameToHexChainId', () => {
    expect(chainNameToHexChainId('ethereum')).toEqual('0x1');
    expect(chainNameToHexChainId('fantom')).toEqual('0xfa');
    expect(chainNameToHexChainId('ethereum-fork')).toEqual('0x7a69');
    expect(chainNameToHexChainId('unsupported')).toEqual('');
  });

  test('chainIdToChainName', () => {
    expect(chainIdToChainName('1')).toEqual('ethereum');
    expect(chainIdToChainName('250')).toEqual('fantom');
    expect(chainIdToChainName('31337')).toEqual('ethereum-fork');
  });

  test('chainIdHexToChainName', () => {
    expect(chainIdHexToChainName('0x1')).toEqual('ethereum');
    expect(chainIdHexToChainName('0xfa')).toEqual('fantom');
    expect(chainIdHexToChainName('0x7a69')).toEqual('ethereum-fork');
  });
});
