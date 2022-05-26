// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { of as mockOf } from 'rxjs';
import { BigNumber as mockBigNumber } from 'ethers';
import { Chain, Decimal as MockDecimal, Ticker, ZERO as mockZERO } from 'tempus-core-services';

export { mockConfig, pool1, pool2, pool3, pool4 } from './mocks/config/mockConfig';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getServices: jest.fn().mockImplementation(() => ({
    StatisticsService: {
      totalValueLockedUSD: jest.fn().mockImplementation((chain: Chain, address: string) => {
        switch (`${chain}-${address}`) {
          case 'ethereum-1':
            return mockOf(new MockDecimal(5000));
          case 'ethereum-2':
            return mockOf(new MockDecimal(7000));
          case 'fantom-3':
            return mockOf(new MockDecimal(2000));
          case 'fantom-4':
            return mockOf(new MockDecimal(9000));
          default:
            return mockZERO;
        }
      }),
      getRate: jest.fn().mockImplementation((chain: Chain, tokenTicker: Ticker) => {
        let price = new MockDecimal(0);
        switch (tokenTicker) {
          case 'ETH':
            price = new MockDecimal(2999);
            break;
          case 'WETH':
            price = new MockDecimal(3001);
            break;
          case 'USDC':
            price = new MockDecimal(chain === 'fantom' ? 1.001 : 0.999);
            break;
          default:
        }

        return mockOf(price);
      }),
      estimatedDepositAndFix: jest.fn(),
      estimatedMintedShares: jest.fn(),
    },
    TempusPoolService: {
      currentInterestRate: jest.fn().mockImplementation(() => mockBigNumber.from(1)),
      numAssetsPerYieldToken: jest.fn().mockImplementation(() => mockBigNumber.from(1)),
    },
  })),
}));
