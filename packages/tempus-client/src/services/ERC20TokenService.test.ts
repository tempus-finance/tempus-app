import ERC20ABI from '../abi/ERC20.json';
import ERC20TokenService from './ERC20TokenService';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

describe('ERC20TokenService', () => {
  const mockAddress = 'token-mock-address';
  const mockProvider = new JsonRpcProvider();

  let instance: ERC20TokenService;

  const mockSymbol = jest.fn();

  beforeEach(() => {
    Contract.mockImplementation(() => {
      return {
        symbol: mockSymbol,
      };
    });
  });

  describe('constructor()', () => {
    test('it returns a valid instance', () => {
      instance = new ERC20TokenService();

      expect(instance).not.toBe(undefined);
    });
  });

  describe('init()', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new ERC20TokenService();
    });

    test('it initialize the instance', () => {
      instance.init({
        Contract,
        address: mockAddress,
        abi: ERC20ABI,
        signerOrProvider: mockProvider,
      });

      expect(instance).toBeInstanceOf(ERC20TokenService);
    });
  });

  describe('symbol()', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      instance = new ERC20TokenService();

      instance.init({
        Contract,
        address: mockAddress,
        abi: ERC20ABI,
        signerOrProvider: mockProvider,
      });
    });

    test('it returns a Promise that resolves with the value of token symbol', async () => {
      mockSymbol.mockImplementation(() => Promise.resolve('aDAI'));

      const result = await instance.symbol();

      expect(result).toBe('aDAI');
    });
  });
});
