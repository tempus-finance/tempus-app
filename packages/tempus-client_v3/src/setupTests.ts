// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { of as mockOf } from 'rxjs';
import { Chain, Decimal as mockDecimal, Ticker, ZERO as mockZERO } from 'tempus-core-services';

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
        protocolDisplayName: 'Lido',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '2',
        backingToken: 'USDC',
        backingTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        chain: 'ethereum',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '3',
        backingToken: 'USDC',
        backingTokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
        maturityDate: new Date(2025, 0, 1).getTime(),
      },
      {
        address: '4',
        backingToken: 'WETH',
        backingTokenAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        chain: 'fantom',
        protocol: 'yearn',
        protocolDisplayName: 'Yearn',
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

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn().mockImplementation(() => ({
    StatisticsService: {
      totalValueLockedUSD: (chain: Chain, address: string) => {
        switch (`${chain}-${address}`) {
          case 'ethereum-1':
            return mockOf(new mockDecimal(5000));
          case 'ethereum-2':
            return mockOf(new mockDecimal(7000));
          case 'fantom-3':
            return mockOf(new mockDecimal(2000));
          case 'fantom-4':
            return mockOf(new mockDecimal(9000));
          default:
            return mockZERO;
        }
      },
      getRate: (chain: Chain, tokenTicker: Ticker) => {
        let price = new mockDecimal(0);
        switch (tokenTicker) {
          case 'ETH':
            price = new mockDecimal(2999);
            break;
          case 'WETH':
            price = new mockDecimal(3001);
            break;
          case 'USDC':
            price = new mockDecimal(chain === 'fantom' ? 1.001 : 0.999);
            break;
          default:
        }

        return mockOf(price);
      },
      estimatedDepositAndFix: jest.fn(),
      estimatedMintedShares: jest.fn(),
    },
  })),
}));
