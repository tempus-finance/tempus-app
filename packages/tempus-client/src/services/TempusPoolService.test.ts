import { TempusPool } from '../abi/TempusPool';
import TempusPoolService from './TempusPoolService';

jest.mock('ethers');
const { Contract } = require('ethers');

describe('TempusPoolService', () => {
  const mockAddresses = ['someAddress'];
  const [mockAddress] = mockAddresses;

  const mockABI = {};
  const mockGetSigner = jest.fn();
  const mockCurrentExchangeRate = jest.fn();
  const mockMaturityTime = jest.fn();

  const mockLibrary = {
    getSigner: mockGetSigner,
  };

  let instance;

  beforeEach(() => {
    Contract.mockImplementation(() => {
      return {
        currentExchangeRate: mockCurrentExchangeRate,
        maturityTime: mockMaturityTime,
      } as TempusPool;
    });
  });

  describe('constructor()', () => {
    test('it returns a valid instance', () => {
      instance = new TempusPoolService();

      expect(instance).not.toBe(undefined);
    });
  });

  describe('init()', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new TempusPoolService();
    });

    test('it initialize the instance', () => {
      instance.init({
        Contract,
        tempusPoolAddresses: mockAddresses,
        TempusPoolABI: mockABI,
        signerOrProvider: mockLibrary,
      });

      const addressesLength = mockAddresses.length;

      expect(mockGetSigner).toHaveBeenCalledTimes(addressesLength);
      expect(instance).toBeInstanceOf(TempusPoolService);
    });
  });

  // TODO
  // - test Promise reject
  describe('methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new TempusPoolService();

      instance.init({
        Contract,
        tempusPoolAddresses: mockAddresses,
        TempusPoolABI: mockABI,
        signerOrProvider: mockLibrary,
      });
    });

    test('it returns a Promise that resolves with the value of the current exchange rate', () => {
      mockCurrentExchangeRate.mockImplementation(() =>
        Promise.resolve({
          toBigInt: jest.fn().mockReturnValue(123.45),
        }),
      );

      instance.getCurrentExchangeRate(mockAddress).then((result: any) => {
        expect(result).toBe(123.45);
      });
    });

    test('it returns a Promise that resolves with the value of the maturity time', () => {
      mockMaturityTime.mockImplementation(() =>
        Promise.resolve({
          toNumber: jest.fn().mockReturnValue(1617494400),
        }),
      );

      instance.getMaturityTime(mockAddress).then((result: any) => {
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2021);
        expect(result.getMonth()).toBe(3);
        expect(result.getUTCDate()).toBe(4);
      });
    });
  });
});
