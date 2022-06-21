// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { BigNumber as MockBigNumber } from 'ethers';
import { of as mockOf, delay as mockDelay } from 'rxjs';
import { Chain, Decimal as MockDecimal, ONE, TempusPool, Ticker, ZERO as mockZERO } from 'tempus-core-services';

export { mockConfig, pool1, pool2, pool3, pool4, pool5 } from './mocks/config/mockConfig';

export const mockGetTokenBalance = jest.fn().mockImplementation(() => Promise.resolve(new MockDecimal(100)));

const mockServices = {
  StatisticsService: {
    totalValueLockedUSD: jest.fn().mockImplementation((chain: Chain, address: string) => {
      switch (`${chain}-${address}`) {
        case 'ethereum-1':
          return mockOf(new MockDecimal(5000)).pipe(mockDelay(100));
        case 'ethereum-2':
          return mockOf(new MockDecimal(7000)).pipe(mockDelay(100));
        case 'fantom-3':
          return mockOf(new MockDecimal(2000)).pipe(mockDelay(100));
        case 'fantom-4':
          return mockOf(new MockDecimal(9000)).pipe(mockDelay(100));
        case 'fantom-5':
          return mockOf(new MockDecimal(8000)).pipe(mockDelay(100));
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
    getUserPoolBalanceUSD: jest.fn().mockImplementation((chain: Chain, tempusPool: TempusPool) => {
      switch (`${chain}-${tempusPool.address}`) {
        case 'ethereum-1':
          return mockOf(new MockDecimal(500));
        case 'ethereum-2':
          return mockOf(new MockDecimal(700));
        case 'fantom-3':
          return mockOf(new MockDecimal(200));
        case 'fantom-4':
          return mockOf(new MockDecimal(900));
        case 'fantom-5':
          return mockOf(new MockDecimal(300));
        default:
          return mockZERO;
      }
    }),
    estimatedDepositAndFix: jest.fn(),
    estimatedMintedShares: jest.fn(),
  },
  TempusPoolService: {
    currentInterestRate: jest.fn().mockResolvedValue(new MockDecimal(1)),
    numAssetsPerYieldToken: jest.fn().mockResolvedValue(new MockDecimal(1)),
  },
  WalletBalanceService: {
    getTokenBalance: mockGetTokenBalance,
  },
  PoolBalanceService: {
    getPoolBalance: jest.fn().mockResolvedValue(new MockDecimal(100)),
  },
  WithdrawService: {
    withdraw: jest.fn().mockResolvedValue({
      contractTransaction: {
        hash: '0x00',
      },
      withdrawnAmount: ONE,
    }),
  },
  DepositService: {
    fixedDeposit: jest.fn().mockResolvedValue({
      contractTransaction: {
        hash: '0x00',
      },
      depositedAmount: ONE,
    }),
  },
  ERC20TokenServiceGetter: jest.fn().mockImplementation(() => ({
    approve: jest.fn().mockResolvedValue({ hash: '0x00' }),
    getAllowance: jest.fn().mockResolvedValue(MockBigNumber.from(10)),
  })),
};

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getDefaultProvider: jest.fn(),
  getServices: jest.fn().mockImplementation(() => mockServices),
  getDefinedServices: jest.fn().mockImplementation(() => mockServices),
}));

jest.mock('@ethersproject/providers', () => ({
  ...jest.requireActual('@ethersproject/providers'),
  JsonRpcSigner: jest.fn(),
}));
