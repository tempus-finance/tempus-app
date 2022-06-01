import { pool1, pool2, pool3, pool4 } from '../mocks/config/mockConfig';
import { getConfigManager } from './getConfigManager';

describe('ConfigManager', () => {
  const configManager = getConfigManager();

  describe('init', () => {
    it('populates chain, pool and tokens lists', async () => {
      configManager.init();

      const chainList = configManager.getChainList();
      const poolList = configManager.getPoolList();
      const tokenList = configManager.getTokenList();

      expect(chainList.length).toEqual(3);
      expect(poolList.length).toEqual(4);
      expect(tokenList.length).toEqual(20);
    });
  });

  describe('getPoolList', () => {
    it('returns a list of pools', () => {
      const result = configManager.getPoolList();

      expect(result).toStrictEqual([pool1, pool2, pool3, pool4]);
    });
  });

  describe('getEarliestStartDate', () => {
    it('returns the earliest start date when no chain is selected', () => {
      const result = configManager.getEarliestStartDate();

      expect(result.getTime()).toBe(1640995200000);
    });

    it('returns the earliest start date on `ethereum` chain', () => {
      const result = configManager.getEarliestStartDate('ethereum');

      expect(result.getTime()).toBe(1640995200000);
    });

    it('returns the earliest start date on `ethereum` chain and `ETH` token', () => {
      const result = configManager.getEarliestStartDate('ethereum', 'ETH');

      expect(result.getTime()).toBe(1640995200000);
    });

    it('returns the earliest start date on `ethereum` chain, `USDC` token and `yearn` protocol', () => {
      const result = configManager.getEarliestStartDate('ethereum', 'USDC', 'yearn');

      expect(result.getTime()).toBe(1643673600000);
    });

    it('returns the earliest start date on `fantom` chain', () => {
      const result = configManager.getEarliestStartDate('fantom');

      expect(result.getTime()).toBe(1642204800000);
    });

    it('returns the earliest start date on `fantom`chain and `WETH` token', () => {
      const result = configManager.getEarliestStartDate('fantom', 'WETH');

      expect(result.getTime()).toBe(1647216000000);
    });

    it('returns the earliest start date on `fantom` chain, `USDC` token and `yearn` protocol', () => {
      const result = configManager.getEarliestStartDate('fantom', 'USDC', 'yearn');

      expect(result.getTime()).toBe(1642204800000);
    });
  });

  describe('getMaturityDates', () => {
    it('returns all dates when no chain is selected', () => {
      const result = configManager.getMaturityDates();

      expect(result[0].getTime()).toBe(1671062400000);
      expect(result[1].getTime()).toBe(1709251200000);
      expect(result[2].getTime()).toBe(1735689600000);
      expect(result[3].getTime()).toBe(1743724800000);
    });

    it('returns all dates when `ethereum` chain is passed', () => {
      const result = configManager.getMaturityDates('ethereum');

      expect(result[0].getTime()).toBe(1709251200000);
      expect(result[1].getTime()).toBe(1735689600000);
    });

    it('returns all dates when `ethereum` chain and `ETH` token are passed', () => {
      const result = configManager.getMaturityDates('ethereum', 'ETH');

      expect(result[0].getTime()).toBe(1735689600000);
    });

    it('returns all dates when `fantom` chain, `WETH` token and `yearn` protocol are passed', () => {
      const result = configManager.getMaturityDates('fantom', 'WETH', 'yearn');

      expect(result[0].getTime()).toBe(1671062400000);
    });
  });

  describe('getChainList', () => {
    it('returns a list of chains', () => {
      const result = configManager.getChainList();

      expect(result).toStrictEqual(['ethereum', 'fantom', 'ethereum-fork']);
    });
  });

  describe('getTokenList', () => {
    it('returns a list of tokens', () => {
      const result = configManager.getTokenList();

      expect(result).toStrictEqual([
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
      ]);
    });
  });
});
