// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

const MILLISECONDS_IN_A_DAY = 86400000;

export const mockConfig = {
  ethereum: {
    tempusPools: [
      {
        address: '1',
        poolId: 'ethereum-1',
        backingToken: 'ETH',
        backingTokenAddress: '0x0000000000000000000000000000000000000000',
      },
      {
        address: '2',
        poolId: 'ethereum-2',
        backingToken: 'USDC',
        backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      },
    ],
  },
  fantom: {
    tempusPools: [
      {
        address: '3',
        poolId: 'fantom-1',
        backingToken: 'USDC',
        backingTokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
      },
      {
        address: '4',
        poolId: 'fantom-2',
        backingToken: 'WETH',
        backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
      },
    ],
  },
};

jest.mock('./config/getConfigManager', () => ({
  getConfigManager: () => ({
    init: () => Promise.resolve(true),
    getChainConfig: (chain: 'ethereum' | 'fantom') => mockConfig[chain],
    getConfig: () => mockConfig,
    getPoolList: () => [
      {
        address: '1',
        backingToken: 'ETH',
        backingTokenAddress: '0x0000000000000000000000000000000000000000',
        chain: 'ethereum',
        protocol: 'lido',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '2',
        backingToken: 'USDC',
        backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: 'ethereum',
        protocol: 'yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '3',
        backingToken: 'USDC',
        backingTokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        chain: 'fantom',
        protocol: 'yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '4',
        backingToken: 'WETH',
        backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        chain: 'fantom',
        protocol: 'yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
    ],
    getTokenList: () => [
      {
        address: '0x0000000000000000000000000000000000000000',
        chain: 'ethereum',
      },
      {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: 'ethereum',
      },
      {
        address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        chain: 'fantom',
      },
      {
        address: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        chain: 'fantom',
      },
    ],
    getChainList: () => ['fantom', 'ethereum'],
  }),
}));
