import { JsonRpcSigner } from '@ethersproject/providers';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { of as mockOf, delay as mockDelay } from 'rxjs';
import { Decimal as MockDecimal, getDefinedServices, Decimal, ZERO } from 'tempus-core-services';
import { useAllowances, subscribeAllowance, resetAllowance } from './useAllowances';

jest.mock('tempus-core-services', () => ({
  ...jest.requireActual('tempus-core-services'),
  getDefinedServices: jest.fn(),
}));

jest.mock('./useServicesLoaded', () => ({
  ...jest.requireActual('./useServicesLoaded'),
  servicesLoaded$: mockOf(true),
}));

jest.mock('./useSigner', () => ({
  ...jest.requireActual('./useSigner'),
  signer$: mockOf({} as unknown as JsonRpcSigner),
}));

jest.mock('./useWalletAddress', () => ({
  ...jest.requireActual('./useWalletAddress'),
  walletAddress$: mockOf('0x0'),
}));

jest.mock('./useApproveToken', () => ({
  ...jest.requireActual('./useApproveToken'),
  tokenApproveStatus$: mockOf({
    pending: false,
    success: true,
    contractTransaction: { hash: '0x00' },
    request: {
      chain: 'fantom',
      tokenAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
      amount: new MockDecimal(1200),
    },
  }).pipe(mockDelay(3000)),
}));

jest.mock('./useTokenBalance', () => ({
  ...jest.requireActual('./useTokenBalance'),
  tokenBalanceDataMap: (() => {
    const map = new Map();
    map.set('ethereum-0x0000000000000000000000000000000000000000', {
      chain: 'ethereum',
      address: '0x0000000000000000000000000000000000000000',
      subject$: mockOf({
        balance: new MockDecimal(10),
        chain: 'ethereum',
        address: '0x0000000000000000000000000000000000000000',
      }),
    });
    map.set('ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', {
      chain: 'ethereum',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      subject$: mockOf({
        balance: new MockDecimal(1000),
        chain: 'ethereum',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      }),
    });
    map.set('fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75', {
      chain: 'fantom',
      address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
      subject$: mockOf({
        balance: new MockDecimal(1200),
        chain: 'fantom',
        address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
      }),
    });
    map.set('fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d', {
      chain: 'fantom',
      address: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
      subject$: mockOf({
        balance: new MockDecimal(0),
        chain: 'fantom',
        address: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
      }),
    });
    return map;
  })(),
}));

describe('useAllowances', () => {
  it('returns the default empty allowance map', async () => {
    act(() => {
      resetAllowance();
      subscribeAllowance();
    });

    const { result } = renderHook(() => useAllowances());

    expect(result.current).toEqual({});
  });

  it('returns the allowance map from chain', async () => {
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      ERC20TokenServiceGetter: jest.fn().mockImplementation(tokenAddress => ({
        getAllowance: jest.fn().mockImplementation(() => {
          switch (tokenAddress) {
            case '0x0000000000000000000000000000000000000000':
              return Promise.resolve(new Decimal(5));
            case '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48':
              return Promise.resolve(new Decimal(600));
            case '0x04068da6c83afcfa0e13ba15a6696662335d5b75':
              return Promise.resolve(new Decimal(500));
            case '0x74b23882a30290451A17c44f4F05243b6b58C76d':
              return Promise.resolve(new Decimal(4));
          }
          return Promise.resolve(new Decimal(10));
        }),
      })),
    }));

    act(() => {
      resetAllowance();
      subscribeAllowance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useAllowances());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current).toEqual({
      'ethereum-0x0000000000000000000000000000000000000000': {
        alwaysApproved: true,
        amount: ZERO,
      },
      'ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
        alwaysApproved: false,
        amount: new Decimal(600),
      },
      'fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75': {
        alwaysApproved: false,
        amount: new Decimal(500),
      },
      'fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d': {
        alwaysApproved: true,
        amount: ZERO,
      },
    });
  });

  it('returns the updated allowance when just approved', async () => {
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => ({
      ERC20TokenServiceGetter: jest.fn().mockImplementation(tokenAddress => ({
        getAllowance: jest.fn().mockImplementation(() => {
          switch (tokenAddress) {
            case '0x0000000000000000000000000000000000000000':
              return Promise.resolve(new Decimal(5));
            case '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48':
              return Promise.resolve(new Decimal(600));
            case '0x04068da6c83afcfa0e13ba15a6696662335d5b75':
              return Promise.resolve(new Decimal(500));
            case '0x74b23882a30290451A17c44f4F05243b6b58C76d':
              return Promise.resolve(new Decimal(4));
          }
          return Promise.resolve(new Decimal(10));
        }),
      })),
    }));

    act(() => {
      resetAllowance();
      subscribeAllowance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useAllowances());

    expect(result.current).toEqual({});

    await waitForNextUpdate();

    expect(result.current).toEqual({
      'ethereum-0x0000000000000000000000000000000000000000': {
        alwaysApproved: true,
        amount: ZERO,
      },
      'ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
        alwaysApproved: false,
        amount: new Decimal(600),
      },
      'fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75': {
        alwaysApproved: false,
        amount: new Decimal(500),
      },
      'fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d': {
        alwaysApproved: true,
        amount: ZERO,
      },
    });

    // waiting for approval status
    await waitForNextUpdate({ timeout: 3000 });

    expect(result.current).toEqual({
      'ethereum-0x0000000000000000000000000000000000000000': {
        alwaysApproved: true,
        amount: ZERO,
      },
      'ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
        alwaysApproved: false,
        amount: new Decimal(600),
      },
      'fantom-0x04068da6c83afcfa0e13ba15a6696662335d5b75': {
        alwaysApproved: false,
        amount: new Decimal(1200),
      },
      'fantom-0x74b23882a30290451A17c44f4F05243b6b58C76d': {
        alwaysApproved: true,
        amount: ZERO,
      },
    });
  });

  test('return empty map when service map is null', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockReturnValue(null);

    act(() => {
      resetAllowance();
      subscribeAllowance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useAllowances());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('return empty map when there is error when getDefinedServices()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    act(() => {
      resetAllowance();
      subscribeAllowance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useAllowances());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('return empty map when there is error when ERC20TokenServiceGetter()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockReturnValue({
      ERC20TokenServiceGetter: jest.fn().mockImplementation(() => {
        throw new Error();
      }),
    });

    act(() => {
      resetAllowance();
      subscribeAllowance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useAllowances());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('return empty map when there is error when getAllowance()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockReturnValue({
      ERC20TokenServiceGetter: jest.fn().mockImplementation(() => ({
        getAllowance: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      })),
    });

    act(() => {
      resetAllowance();
      subscribeAllowance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useAllowances());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });

  test('return empty map when there is rejected promise when getAllowance()', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    (getDefinedServices as unknown as jest.Mock).mockReturnValue({
      ERC20TokenServiceGetter: jest.fn().mockImplementation(() => ({
        getAllowance: jest.fn().mockRejectedValue({}),
      })),
    });

    act(() => {
      resetAllowance();
      subscribeAllowance();
    });

    const { result, waitForNextUpdate } = renderHook(() => useAllowances());

    expect(result.current).toEqual({});

    try {
      await waitForNextUpdate();
    } catch (e) {
      // when error, the failed polling will be skipped and thus no updates on hook
    }

    expect(console.error).toHaveBeenCalled();

    (console.error as jest.Mock).mockRestore();
  });
});
