// External libraries
import { CallOverrides } from '@ethersproject/contracts';

// Services
import PriceOracleService from './PriceOracleService';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');
const { BigNumber } = jest.requireActual('ethers');

describe('PriceOracleService', () => {
  const mockCurrentRate = jest.fn();

  let instance: PriceOracleService;

  beforeEach(() => {
    Contract.mockImplementation(() => {
      return {
        currentRate: mockCurrentRate,
      };
    });
  });

  describe('constructor()', () => {
    test('it returns a valid instance', () => {
      instance = new PriceOracleService('mock-address');

      expect(instance).not.toBe(undefined);
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new PriceOracleService('mock-address');
    });

    test('it returns a Promise that resolves with the value of the current rate', async () => {
      mockCurrentRate.mockImplementation((address: string, overrides: CallOverrides) =>
        Promise.resolve(BigNumber.from('10')),
      );

      const currentRate = await instance.currentRate('mock-token-address');

      expect(currentRate).toBeInstanceOf(BigNumber);
      expect(currentRate?.toNumber()).toEqual(10);
    });
  });
});
