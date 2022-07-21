import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { JsonRpcSigner } from '@ethersproject/providers';
import { of as mockOf, delay as mockDelay, merge as mockMerge, throwError } from 'rxjs';
import { ZERO_ADDRESS, Decimal, getDefinedServices } from 'tempus-core-services';
import { getConfigManager } from '../config/getConfigManager';
import { mockGetTokenBalance, mockServices } from '../setupTests';
import { resetTokenBalance, subscribeTokenBalance, useTokenBalance, useTokenBalances } from './useTokenBalance';
import { pool1 as mockPool1 } from '../setupTests';

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true),
}));

jest.mock('./useWalletAddress', () => ({
  ...jest.requireActual('./useWalletAddress'),
  walletAddress$: mockOf('0x0'),
}));

jest.mock('./useSelectedChain', () => ({
  ...jest.requireActual('./useSelectedChain'),
  selectedChain$: mockOf('ethereum'),
}));

jest.mock('./useSigner', () => ({
  ...jest.requireActual('./useSigner'),
  signer$: mockOf({} as unknown as JsonRpcSigner),
}));

jest.mock('./useAppEvent', () => ({
  ...jest.requireActual('./useAppEvent'),
  appEvent$: mockMerge(
    mockOf({
      eventType: 'deposit',
      tempusPool: mockPool1,
      txnHash: '0x0',
    }).pipe(mockDelay(1000)),
    mockOf({
      eventType: 'withdraw',
      tempusPool: mockPool1,
      txnHash: '0x1',
    }).pipe(mockDelay(2000)),
  ),
}));

describe('useTvlData', () => {
  beforeAll(getConfigManager);

  test('returns whole token balance map', async () => {
    act(() => {
      resetTokenBalance();
      subscribeTokenBalance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenBalances());

    expect(result.current).toEqual({
      'ethereum-00001-amm': null,
      'ethereum-00001-p': null,
      'ethereum-00001-y': null,
      'ethereum-00001-ybt': null,
      'ethereum-00002-amm': null,
      'ethereum-00002-p': null,
      'ethereum-00002-y': null,
      'ethereum-00002-ybt': null,
      'ethereum-0x0000000000000000000000000000000000000000': null,
      'ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': null,
      'ethereum-fork-0x0000000000000000000000000000000000000000': null,
      'fantom-00003-amm': null,
      'fantom-00003-p': null,
      'fantom-00003-y': null,
      'fantom-00003-ybt': null,
      'fantom-00004-amm': null,
      'fantom-00004-p': null,
      'fantom-00004-y': null,
      'fantom-00004-ybt': null,
      'fantom-0x0000000000000000000000000000000000000000': null,
      'fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75': null,
      'fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d': null,
    });

    await waitForNextUpdate();

    expect(result.current).toEqual({
      'ethereum-00001-amm': new Decimal(100),
      'ethereum-00001-p': new Decimal(100),
      'ethereum-00001-y': new Decimal(100),
      'ethereum-00001-ybt': new Decimal(100),
      'ethereum-00002-amm': new Decimal(100),
      'ethereum-00002-p': new Decimal(100),
      'ethereum-00002-y': new Decimal(100),
      'ethereum-00002-ybt': new Decimal(100),
      'ethereum-0x0000000000000000000000000000000000000000': new Decimal(100),
      'ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': new Decimal(100),
      'ethereum-fork-0x0000000000000000000000000000000000000000': null,
      'fantom-00003-amm': null,
      'fantom-00003-p': null,
      'fantom-00003-y': null,
      'fantom-00003-ybt': null,
      'fantom-00004-amm': null,
      'fantom-00004-p': null,
      'fantom-00004-y': null,
      'fantom-00004-ybt': null,
      'fantom-0x0000000000000000000000000000000000000000': null,
      'fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75': null,
      'fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d': null,
    });
  });

  test('returns balance of a token', async () => {
    act(() => {
      resetTokenBalance();
      subscribeTokenBalance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(result.current).toEqual({
      address: ZERO_ADDRESS,
      chain: 'ethereum',
      balance: null,
    });

    await waitForNextUpdate();

    expect(result.current).toEqual({
      address: ZERO_ADDRESS,
      chain: 'ethereum',
      balance: new Decimal(100),
    });
  });

  test('returns null if token does not exist', async () => {
    act(() => {
      resetTokenBalance();
      subscribeTokenBalance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenBalance('0x01', 'ethereum'));

    expect(result.current).toBeNull();

    try {
      await waitForNextUpdate();
    } catch (e) {}

    expect(result.current).toBeNull();
  });

  test('does not re-fetch token balance from chain on 2nd component render', async () => {
    act(() => {
      resetTokenBalance();
      subscribeTokenBalance();
    });

    const { result: result1, waitForNextUpdate } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(result1.current).toEqual({
      address: ZERO_ADDRESS,
      chain: 'ethereum',
      balance: null,
    });
    expect(mockGetTokenBalance).toHaveBeenCalledTimes(10);

    await waitForNextUpdate();

    const { result: result2 } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(mockGetTokenBalance).toHaveBeenCalledTimes(10);
    expect(result2.current).toEqual({
      address: ZERO_ADDRESS,
      chain: 'ethereum',
      balance: new Decimal(100),
    });
  });

  xtest('returns updated balance of a token after txn', async () => {
    (getDefinedServices as jest.Mock).mockImplementation(() => ({
      ...mockServices,
      WalletBalanceService: {
        getTokenBalance: mockGetTokenBalance,
      },
      ERC20TokenServiceGetter: jest.fn().mockImplementation((address, chain) => ({
        onTransfer: jest.fn().mockImplementation((_from, _to, callback) => {
          if (chain === 'ethereum' && address === ZERO_ADDRESS) {
            setTimeout(() => callback(), 3000);
          }
        }),
      })),
    }));

    act(() => {
      resetTokenBalance();
      subscribeTokenBalance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(result.current).toEqual({
      address: ZERO_ADDRESS,
      chain: 'ethereum',
      balance: null,
    });

    await waitForNextUpdate();

    expect(result.current).toEqual({
      address: ZERO_ADDRESS,
      chain: 'ethereum',
      balance: new Decimal(100),
    });

    // by walletStream$
    expect(mockGetTokenBalance).toHaveBeenCalledTimes(10);

    await waitForNextUpdate();

    // by eventStream$
    expect(mockGetTokenBalance).toHaveBeenCalledTimes(15);

    await waitForNextUpdate();

    // by eventStream$
    expect(mockGetTokenBalance).toHaveBeenCalledTimes(20);

    await waitForNextUpdate();

    // by transactionStream$
    expect(mockGetTokenBalance).toHaveBeenCalledTimes(22);
  });

  test('no updates when service map is null', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as jest.Mock).mockReturnValue(null);

    act(() => {
      resetTokenBalance();
      subscribeTokenBalance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(result.current).toEqual({
      balance: null,
      address: ZERO_ADDRESS,
      chain: 'ethereum',
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is an error when getDefinedServices()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    act(() => {
      resetTokenBalance();
      subscribeTokenBalance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(result.current).toEqual({
      balance: null,
      address: ZERO_ADDRESS,
      chain: 'ethereum',
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is an error when getTokenBalance()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as jest.Mock).mockImplementation(() => ({
      WalletBalanceService: {
        getTokenBalance: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      },
    }));

    act(() => {
      resetTokenBalance();
      subscribeTokenBalance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(result.current).toEqual({
      balance: null,
      address: ZERO_ADDRESS,
      chain: 'ethereum',
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('no updates when there is an Observable<Error> when getTokenBalance()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as jest.Mock).mockImplementation(() => ({
      WalletBalanceService: {
        getTokenBalance: jest.fn().mockReturnValue(throwError(() => new Error())),
      },
    }));

    act(() => {
      resetTokenBalance();
      subscribeTokenBalance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useTokenBalance(ZERO_ADDRESS, 'ethereum'));

    expect(result.current).toEqual({
      balance: null,
      address: ZERO_ADDRESS,
      chain: 'ethereum',
    });

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
