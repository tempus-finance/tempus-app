import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import { SUPPORTED_LOCALES, SUPPORTED_LOCALE_NAMES, useLocale } from './useLocale';

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

  it('it export SUPPORTED_LOCALES', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'es', 'it']);
  });

  it('it export SUPPORTED_LOCALE_NAMES', () => {
    expect(SUPPORTED_LOCALE_NAMES).toEqual({
      en: 'English',
      es: 'Español',
      it: 'Italiano',
    });
  });
});
