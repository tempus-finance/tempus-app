// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

export const mockConfig = {
  ethereum: {
    tempusPools: [
      {
        address: '1',
        poolId: 'ethereum-1',
      },
      {
        address: '2',
        poolId: 'ethereum-2',
      },
    ],
  },
  fantom: {
    tempusPools: [
      {
        address: '3',
        poolId: 'fantom-1',
      },
      {
        address: '4',
        poolId: 'fantom-2',
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
        chain: 'ethereum',
      },
      {
        address: '2',
        backingToken: 'USDC',
        chain: 'ethereum',
      },
      {
        address: '3',
        backingToken: 'USDC',
        chain: 'fantom',
      },
      {
        address: '4',
        backingToken: 'ETH',
        chain: 'fantom',
      },
    ],
    getTokenList: () => [
      {
        address: '1',
        chain: 'ethereum',
      },
      {
        address: '2',
        chain: 'ethereum',
      },
      {
        address: '3',
        chain: 'fantom',
      },
      {
        address: '4',
        chain: 'fantom',
      },
    ],
  }),
}));
