import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { useLocale } from './useLocale';

describe('useLocale', () => {
  it('by default it return "en"', () => {
    const { result } = renderHook(() => useLocale());
    const [locale] = result.current;

    expect(locale).toEqual('en');
  });

  it('update locale to "es"', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLocale());
    const [locale, setLocale] = result.current;

    expect(locale).toEqual('en');

    await act(async () => {
      setLocale('es');
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual('es');
  });

  it('update locale to "it"', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLocale());
    const [locale, setLocale] = result.current;

    expect(locale).toEqual('en');

    await act(async () => {
      setLocale('it');
      await waitForNextUpdate();
    });

    expect(result.current[0]).toEqual('it');
  });
});
