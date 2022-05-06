import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { Decimal } from 'tempus-core-services';
import { useUserPreferences } from './useUserPreferences';

describe('useUserPreferences', () => {
  it('check default value', () => {
    const { result } = renderHook(() => useUserPreferences());
    const [userPreference] = result.current;
    const expected = {
      slippage: new Decimal(0.02),
      slippageAuto: false,
      darkMode: false,
    };

    expect(userPreference).toEqual(expected);
  });

  it('update slippage to 3.5%', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserPreferences());
    const [userPreference, setUserPreference] = result.current;
    const expected1 = {
      slippage: new Decimal(0.02),
      slippageAuto: false,
      darkMode: false,
    };

    expect(userPreference).toEqual(expected1);

    await act(async () => {
      setUserPreference({ slippage: new Decimal(0.035) });
      await waitForNextUpdate();
    });

    const expected2 = {
      slippage: new Decimal(0.035),
      slippageAuto: false,
      darkMode: false,
    };

    expect(result.current[0]).toEqual(expected2);
  });

  it('update darkMode to true', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserPreferences());
    const [userPreference, setUserPreference] = result.current;
    const expected1 = {
      slippage: new Decimal(0.02),
      slippageAuto: false,
      darkMode: false,
    };

    expect(userPreference).toEqual(expected1);

    await act(async () => {
      setUserPreference({ darkMode: true });
      await waitForNextUpdate();
    });

    const expected2 = {
      slippage: new Decimal(0.02),
      slippageAuto: false,
      darkMode: true,
    };

    expect(result.current[0]).toEqual(expected2);
  });

  it('update multiple user preference at once', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserPreferences());
    const [userPreference, setUserPreference] = result.current;
    const expected1 = {
      slippage: new Decimal(0.02),
      slippageAuto: false,
      darkMode: false,
    };

    expect(userPreference).toEqual(expected1);

    await act(async () => {
      setUserPreference({ slippage: new Decimal(0.035), slippageAuto: true, darkMode: true });
      await waitForNextUpdate();
    });

    const expected2 = {
      slippage: new Decimal(0.035),
      slippageAuto: true,
      darkMode: true,
    };

    expect(result.current[0]).toEqual(expected2);
  });

  it('update user preferences with undefined', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserPreferences());
    const [userPreference, setUserPreference] = result.current;
    const expected = {
      slippage: new Decimal(0.02),
      slippageAuto: false,
      darkMode: false,
    };

    expect(userPreference).toEqual(expected);

    await act(async () => {
      setUserPreference({ slippage: undefined, slippageAuto: undefined, darkMode: undefined });

      // timeout becoz no update will occur
      try {
        await waitForNextUpdate();
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });
});
