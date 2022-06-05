import { renderHook } from '@testing-library/react-hooks';
import { useTokenList } from './useTokenList';

it('returns token list from config file', async () => {
  const { result } = renderHook(() => useTokenList());

  expect(result.current).toStrictEqual([
    {
      address: '0x0000000000000000000000000000000000000000',
      chain: 'ethereum',
    },
    {
      address: '00001-ybt',
      chain: 'ethereum',
    },
    {
      address: '00001-p',
      chain: 'ethereum',
    },
    {
      address: '00001-y',
      chain: 'ethereum',
    },
    {
      address: '00001-amm',
      chain: 'ethereum',
    },
    {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      chain: 'ethereum',
    },
    {
      address: '00002-ybt',
      chain: 'ethereum',
    },
    {
      address: '00002-p',
      chain: 'ethereum',
    },
    {
      address: '00002-y',
      chain: 'ethereum',
    },
    {
      address: '00002-amm',
      chain: 'ethereum',
    },
    {
      address: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
      chain: 'fantom',
    },
    {
      address: '00003-ybt',
      chain: 'fantom',
    },
    {
      address: '00003-p',
      chain: 'fantom',
    },
    {
      address: '00003-y',
      chain: 'fantom',
    },
    {
      address: '00003-amm',
      chain: 'fantom',
    },
    {
      address: '0x74b23882a30290451A17c44f4F05243b6b58C76d',
      chain: 'fantom',
    },
    {
      address: '00004-ybt',
      chain: 'fantom',
    },
    {
      address: '00004-p',
      chain: 'fantom',
    },
    {
      address: '00004-y',
      chain: 'fantom',
    },
    {
      address: '00004-amm',
      chain: 'fantom',
    },
    {
      address: '0x0000000000000000000000000000000000000000',
      chain: 'fantom',
    },
    {
      address: '0x0000000000000000000000000000000000000000',
      chain: 'ethereum-fork',
    },
  ]);
});
