// Services
import { CallOverrides } from 'ethers';
import TempusPoolService from './TempusPoolService';

jest.mock('ethers');
const { Contract } = jest.requireMock('ethers');
const { utils } = jest.requireMock('ethers');
const { BigNumber } = jest.requireActual('ethers');

jest.mock('@ethersproject/providers');
const { JsonRpcProvider } = jest.requireMock('@ethersproject/providers');

jest.mock('./getERC20TokenService');
const getERC20TokenService = jest.requireMock('./getERC20TokenService');

describe('TempusPoolService', () => {
  const mockBackingTokenAddress = 'dummy-backing-token-address';
  const mockAddresses = ['someAddress'];
  const [mockAddress] = mockAddresses;

  const mockABI = {};
  const mockCurrentInterestRate = jest.fn();
  const mockMaturityTime = jest.fn();
  const mockStartTime = jest.fn();
  const mockGetBlock = jest.fn();
  const mockYieldBearingToken = jest.fn();
  const mockCurrentRate = jest.fn();
  const mockQueryFilter = jest.fn();
  const mockBackingToken = jest.fn();
  const mockProtocolName = jest.fn();
  const mockPricePerYieldShareStored = jest.fn();
  const mockPricePerPrincipalShareStored = jest.fn();
  const mockYieldShare = jest.fn();
  const mockPrincipalShare = jest.fn();

  const mockSymbol = jest.fn();

  const mockProvider = new JsonRpcProvider();

  let instance: TempusPoolService;

  beforeEach(() => {
    Contract.mockImplementation(() => {
      return {
        currentInterestRate: mockCurrentInterestRate,
        maturityTime: mockMaturityTime,
        startTime: mockStartTime,
        yieldBearingToken: mockYieldBearingToken,
        queryFilter: mockQueryFilter,
        backingToken: mockBackingToken,
        protocolName: mockProtocolName,
        pricePerYieldShareStored: mockPricePerYieldShareStored,
        pricePerPrincipalShareStored: mockPricePerPrincipalShareStored,
        yieldShare: mockYieldShare,
        principalShare: mockPrincipalShare,
        provider: {
          getBlock: mockGetBlock,
        },
        filters: {
          Deposited: jest.fn(),
          Redeemed: jest.fn(),
        },
      };
    });

    getERC20TokenService.default.mockImplementation(() => {
      return {
        symbol: mockSymbol,
      };
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
        signerOrProvider: mockProvider,
      });

      expect(instance).toBeInstanceOf(TempusPoolService);
    });
  });

  // TODO
  // - test Promise reject
  describe('methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      mockCurrentRate.mockImplementation((address: string, tokenAddress: string, overrides: {}) => {
        if (!overrides) {
          return Promise.resolve(BigNumber.from('10'));
        } else {
          return Promise.resolve(BigNumber.from('9'));
        }
      });

      instance = new TempusPoolService();
      instance.init({
        Contract,
        tempusPoolAddresses: mockAddresses,
        TempusPoolABI: mockABI,
        signerOrProvider: mockProvider,
      });
    });

    test('it returns a Promise that resolves with the value of the current exchange rate', () => {
      mockCurrentInterestRate.mockImplementation(() =>
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

    test('it returns a Promise that resolves with the value of the start time', () => {
      mockStartTime.mockImplementation(() =>
        Promise.resolve({
          toNumber: jest.fn().mockReturnValue(1617494400),
        }),
      );

      instance.getStartTime(mockAddress).then((result: Date) => {
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2021);
        expect(result.getMonth()).toBe(3);
        expect(result.getUTCDate()).toBe(4);
      });
    });

    test('it returns variable APY for the pool', () => {
      mockGetBlock.mockImplementation((blockNumber: number | string) => {
        if (blockNumber === 'latest') {
          return Promise.resolve({
            number: 100,
            timestamp: 200,
          });
        } else {
          return Promise.resolve({
            number: 50,
            timestamp: 100,
          });
        }
      });
      mockCurrentInterestRate.mockImplementation((overrides: CallOverrides) => {
        if (overrides) {
          return Promise.resolve(BigNumber.from('1'));
        } else {
          return Promise.resolve(BigNumber.from('2'));
        }
      });

      utils.formatEther.mockImplementation((value: number) => value);

      instance.getVariableAPY(mockAddress).then(result => {
        expect(result).toEqual(31536000);
      });
    });

    test('it returns a pool backing token ticker', async () => {
      mockBackingToken.mockImplementation(() => mockBackingTokenAddress);
      mockSymbol.mockImplementation(() => Promise.resolve('DAI'));

      const ticker = await instance.getBackingTokenTicker(mockAddress);

      expect(ticker).toBe('DAI');
    });

    test('it returns a pool yield bearing token ticker', async () => {
      mockYieldBearingToken.mockImplementation(() => Promise.resolve('yield-bearing-token-address'));
      mockSymbol.mockImplementation(() => Promise.resolve('aDAI'));

      const ticker = await instance.getYieldBearingTokenTicker(mockAddress);

      expect(ticker).toBe('aDAI');
    });

    test('it returns a name of the protocol', async () => {
      mockProtocolName.mockImplementation(() => Promise.resolve('Aave'));

      utils.parseBytes32String.mockImplementation((value: string) => value);

      const protocolName = await instance.getProtocolName(mockAddress);

      expect(protocolName).toBe('aave');
    });

    test('it returns a a list of deposited events', async () => {
      mockQueryFilter.mockImplementation(() => {
        return Promise.resolve([
          {
            event: 'test-deposit-event',
          },
        ]);
      });

      const depositedEvents = await instance.getDepositedEvents(mockAddress);

      expect(depositedEvents.length).toBe(1);
      expect(depositedEvents[0].event).toBe('test-deposit-event');
    });

    test('it returns a a list of redeemed events', async () => {
      mockQueryFilter.mockImplementation(() => {
        return Promise.resolve([
          {
            event: 'test-redeem-event',
          },
        ]);
      });

      const depositedEvents = await instance.getRedeemedEvents(mockAddress);

      expect(depositedEvents.length).toBe(1);
      expect(depositedEvents[0].event).toBe('test-redeem-event');
    });

    test('it returns price per yield share stored', async () => {
      mockPricePerYieldShareStored.mockImplementation(() => Promise.resolve(BigNumber.from('1')));

      const pricePerYieldShareStored = await instance.pricePerYieldShareStored(mockAddress);

      expect(pricePerYieldShareStored).toBeInstanceOf(BigNumber);
      expect(pricePerYieldShareStored.toNumber()).toBe(1);
    });

    test('it returns price per principal share stored', async () => {
      mockPricePerPrincipalShareStored.mockImplementation(() => Promise.resolve(BigNumber.from('10')));

      const pricePerPrincipalShareStored = await instance.pricePerPrincipalShareStored(mockAddress);

      expect(pricePerPrincipalShareStored).toBeInstanceOf(BigNumber);
      expect(pricePerPrincipalShareStored.toNumber()).toBe(10);
    });

    test('it returns address of the yield token', async () => {
      mockYieldShare.mockImplementation(() => Promise.resolve('mock-yield-share-address'));

      const yieldTokenAddress = await instance.getYieldTokenAddress(mockAddress);

      expect(yieldTokenAddress).toBe('mock-yield-share-address');
    });

    test('it returns address of the principal token', async () => {
      mockPrincipalShare.mockImplementation(() => Promise.resolve('mock-principal-share-address'));

      const principalTokenAddress = await instance.getPrincipalTokenAddress(mockAddress);

      expect(principalTokenAddress).toBe('mock-principal-share-address');
    });

    test('it returns address of the backing token', async () => {
      mockBackingToken.mockImplementation(() => Promise.resolve(mockBackingTokenAddress));

      const principalTokenAddress = await instance.getBackingTokenAddress(mockAddress);

      expect(principalTokenAddress).toBe(mockBackingTokenAddress);
    });
  });
});
