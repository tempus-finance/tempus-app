import { BigNumber } from 'ethers';
import { DEADLINE_PRECISION, INFINITE_DEADLINE } from '../constants';
import { Decimal } from '../datastructures';
import { DepositService } from './DepositService';

jest.mock('@ethersproject/providers');
const { JsonRpcSigner } = jest.requireMock('@ethersproject/providers');

const depositAndFixMock = jest.fn().mockImplementation(() => ({
  wait: jest.fn(),
  value: BigNumber.from(1),
}));
const getExpectedReturnGivenInMock = jest.fn().mockImplementation(() => new Decimal(1));

jest.mock('../contracts/TempusControllerV1Contract', () => ({
  TempusControllerV1Contract: jest.fn().mockImplementation(() => ({ depositAndFix: depositAndFixMock })),
}));

jest.mock('../contracts/TempusAMMV1Contract', () => ({
  TempusAMMV1Contract: jest.fn().mockImplementation(() => ({ getExpectedReturnGivenIn: getExpectedReturnGivenInMock })),
}));

describe('DepositService', () => {
  const mockGetConfig = jest.fn().mockReturnValue({
    'ethereum-fork': {
      tempusPools: [
        {
          address: 'test-pool',
          ammAddress: 'test-amm',
          backingTokenAddress: 'test-token',
          backingToken: 'ETH',
          chain: 'ethereum-fork',
          tokenPrecision: {
            backingToken: 18,
            yields: 6,
          },
        },
      ],
      tempusControllerContract: 'test-tempus-controller',
    },
  });
  const mockSigner = new JsonRpcSigner();

  describe('constructor()', () => {
    test('it returns a valid instance', () => {
      const instance = new DepositService('ethereum-fork', mockGetConfig);

      expect(instance).not.toBe(undefined);
    });

    test('it properly sets chain on instance', () => {
      const instance = new DepositService('ethereum-fork', mockGetConfig);

      expect(instance.chain).toBe('ethereum-fork');
    });
  });

  describe('fixedDeposit()', () => {
    test('it calls TempusController contract with correct parameters', async () => {
      const instance = new DepositService('ethereum-fork', mockGetConfig);

      const poolAddress = 'test-pool';
      const tokenAmount = new Decimal(5);
      const tokenTicker = 'ETH';
      const tokenAddress = 'test-token';
      const slippage = new Decimal(0.05);
      const deadline = new Decimal(INFINITE_DEADLINE, DEADLINE_PRECISION);

      await instance.fixedDeposit(poolAddress, tokenAmount, tokenTicker, tokenAddress, slippage, mockSigner);

      expect(depositAndFixMock).toHaveBeenCalledTimes(1);
      expect(depositAndFixMock).toHaveBeenCalledWith(
        'test-amm',
        tokenAmount,
        tokenTicker,
        18,
        6,
        true,
        new Decimal(0.95),
        deadline,
      );
    });
  });
});
