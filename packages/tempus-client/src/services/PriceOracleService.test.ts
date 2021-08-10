// External libraries
import { CallOverrides } from '@ethersproject/contracts';

// Interfaces
import { PriceOracle } from '../interfaces/PriceOracle';

// Services
import PriceOracleService from './PriceOracleService';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');
const { BigNumber } = jest.requireActual('ethers');

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

describe('PriceOracleService', () => {
  const mockPriceOraclesConfig: PriceOracle[] = [
    {
      address: 'price-oracle-address',
      name: 'aave',
    },
  ];
  const mockAddress = mockPriceOraclesConfig[0].address;

  const mockCurrentRate = jest.fn();

  let instance: PriceOracleService;

  const mockProvider = new JsonRpcProvider();

  beforeEach(() => {
    Contract.mockImplementation(() => {
      return {
        currentRate: mockCurrentRate,
      };
    });
  });

  describe('constructor()', () => {
    test('it returns a valid instance', () => {
      instance = new PriceOracleService();

      expect(instance).not.toBe(undefined);
    });
  });

  describe('init()', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new PriceOracleService();
    });

    test('it initialize the instance', () => {
      instance.init({
        Contract,
        priceOraclesConfig: mockPriceOraclesConfig,
        signerOrProvider: mockProvider,
      });

      expect(instance).toBeInstanceOf(PriceOracleService);
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new PriceOracleService();

      instance.init({
        Contract,
        priceOraclesConfig: mockPriceOraclesConfig,
        signerOrProvider: mockProvider,
      });
    });

    test('it returns a Promise that resolves with the value of the current rate', async () => {
      mockCurrentRate.mockImplementation((address: string, overrides: CallOverrides) =>
        Promise.resolve(BigNumber.from('10')),
      );

      const currentRate = await instance.currentRate(mockAddress, 'mock-token-address');

      expect(currentRate).toBeInstanceOf(BigNumber);
      expect(currentRate?.toNumber()).toEqual(10);
    });
  });
});
