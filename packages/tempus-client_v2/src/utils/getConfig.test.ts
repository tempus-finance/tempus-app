import getConfig, { getConfigForPoolWithId, getConfigForPoolWithAddress } from './getConfig';
import * as getCookie from './getCookie';
import config from '../config/config';
import { Config } from '../interfaces/Config';

describe('getConfig', () => {
  const MOCK_TEMPUS_POOL = [
    {
      address: '0x0000000000000000000000000000000000000000',
      poolId: 'DUMMY_POOL_ID_1',
      ammAddress: '0x0000000000000000000000000000000000000001',
      principalsAddress: '0x0000000000000000000000000000000000000002',
      yieldsAddress: '0x0000000000000000000000000000000000000003',
      yieldBearingTokenAddress: '0x0000000000000000000000000000000000000004',
      backingTokenAddress: '0x0000000000000000000000000000000000000005',
      startDate: new Date(2022, 0, 1).getTime(),
      maturityDate: new Date(2022, 6, 1).getTime(),
      protocol: 'lido',
      backingToken: 'ETH',
      yieldBearingToken: 'stETH',
      spotPrice: '2',
      decimalsForUI: 4,
      tokenPrecision: {
        backingToken: 18,
        lpTokens: 18,
        principals: 18,
        yieldBearingToken: 18,
        yields: 18,
      },
    },
    {
      address: '0x0000000000000000000000000000000000000010',
      poolId: 'DUMMY_POOL_ID_2',
      ammAddress: '0x0000000000000000000000000000000000000011',
      principalsAddress: '0x0000000000000000000000000000000000000012',
      yieldsAddress: '0x0000000000000000000000000000000000000013',
      yieldBearingTokenAddress: '0x0000000000000000000000000000000000000014',
      backingTokenAddress: '0x0000000000000000000000000000000000000015',
      startDate: new Date(2022, 0, 1).getTime(),
      maturityDate: new Date(2022, 6, 1).getTime(),
      protocol: 'rari',
      backingToken: 'USDC',
      yieldBearingToken: 'RCPT',
      spotPrice: '2',
      decimalsForUI: 2,
      tokenPrecision: {
        backingToken: 6,
        lpTokens: 18,
        principals: 6,
        yieldBearingToken: 18,
        yields: 18,
      },
    },
  ];
  const MOCK_CONFIG = { tempusPools: MOCK_TEMPUS_POOL } as Config;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(getCookie, 'default').mockReturnValue('');
  });
  afterEach(jest.restoreAllMocks);

  describe('getConfig()', () => {
    test('return default config if no TEMPUS_OVERRIDING_CONFIG cookie exists', () => {
      expect(getConfig()).toEqual(config);
      expect(getCookie.default).toHaveBeenCalledWith('TEMPUS_OVERRIDING_CONFIG');
    });

    test('return overriding config if TEMPUS_OVERRIDING_CONFIG cookie exists', () => {
      jest.spyOn(getCookie, 'default').mockReturnValue(JSON.stringify(MOCK_CONFIG));

      expect(getConfig()).toEqual(MOCK_CONFIG);
      expect(getCookie.default).toHaveBeenCalledWith('TEMPUS_OVERRIDING_CONFIG');
    });

    test("return default config if TEMPUS_OVERRIDING_CONFIG cookie exists but it's not a JSON object", () => {
      jest.spyOn(getCookie, 'default').mockReturnValue(JSON.stringify(MOCK_CONFIG) + 'aaa');

      expect(getConfig()).toEqual(config);
      expect(getCookie.default).toHaveBeenCalledWith('TEMPUS_OVERRIDING_CONFIG');
      expect(console.error).toHaveBeenCalledWith(
        'Failed to parse environment config from cookie. Using default config as a fallback.',
      );
    });
  });

  describe('getConfigForPoolWithId()', () => {
    test('throw error if pool ID not found in the config', () => {
      const poolId = 'DUMMY_POOL_ID_0';

      try {
        getConfigForPoolWithId(poolId);
      } catch (e) {
        expect(e).toEqual(new Error(`Failed to get pool config with pool id ${poolId}`));
      }
    });

    test('return config with corresponding pool ID', () => {
      const poolId = config.tempusPools[1].poolId;

      expect(getConfigForPoolWithId(poolId)).toEqual(config.tempusPools[1]);
    });
  });

  describe('getConfigForPoolWithAddress()', () => {
    test('throw error if pool address not found in the config', () => {
      const poolAddress = '0x0000000000000000000000000000000000000020';

      try {
        getConfigForPoolWithAddress(poolAddress);
      } catch (e) {
        expect(e).toEqual(new Error(`Failed to get pool config with pool address ${poolAddress}`));
      }
    });

    test('return config with corresponding pool address', () => {
      const poolAddress = config.tempusPools[1].address;

      expect(getConfigForPoolWithAddress(poolAddress)).toEqual(config.tempusPools[1]);
    });
  });
});
