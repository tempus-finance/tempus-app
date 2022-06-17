import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import i18n, { SupportedLocale } from '../i18n';
import { useLocale } from './useLocale';

jest.mock('../i18n', () => ({
  languages: ['en'],
  changeLanguage: jest.fn<void, [SupportedLocale]>().mockImplementation(() => {}),
}));

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

    expect(i18n.changeLanguage).toBeCalledTimes(1);
    expect(i18n.changeLanguage).toBeCalledWith('es');

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

    expect(i18n.changeLanguage).toBeCalledTimes(1);
    expect(i18n.changeLanguage).toBeCalledWith('it');

    expect(result.current[0]).toEqual('it');
  });
});
