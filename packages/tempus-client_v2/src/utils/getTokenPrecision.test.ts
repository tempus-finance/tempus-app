import { Config } from '../interfaces/Config';
import { TokenTypePrecision } from '../interfaces/TokenPrecision';
import * as getConfig from './getConfig';
import getTokenPrecision from './getTokenPrecision';

describe('getTokenPrecision()', () => {
  beforeEach(() => {
    jest.spyOn(getConfig, 'getConfig').mockReturnValue({
      fantom: {
        tempusPools: [
          {
            address: 'abc',
            tokenPrecision: {
              backingToken: 4,
              yieldBearingToken: 12,
              principals: 7,
              yields: 0,
              lpTokens: 9,
            },
          },
          {
            address: 'xyz',
            tokenPrecision: {
              backingToken: 4,
            },
          },
        ],
      },
    } as unknown as Config);
  });

  test('it returns backing token precision', () => {
    const poolAddress = 'abc';
    const tokenTypePrecision: TokenTypePrecision = 'backingToken';
    const precision = getTokenPrecision(poolAddress, tokenTypePrecision);

    expect(precision).toBe(4);
  });

  test('it returns yield bearing token precision', () => {
    const poolAddress = 'abc';
    const tokenTypePrecision: TokenTypePrecision = 'yieldBearingToken';
    const precision = getTokenPrecision(poolAddress, tokenTypePrecision);

    expect(precision).toBe(12);
  });

  test('it returns principals token precision', () => {
    const poolAddress = 'abc';
    const tokenTypePrecision: TokenTypePrecision = 'principals';
    const precision = getTokenPrecision(poolAddress, tokenTypePrecision);

    expect(precision).toBe(7);
  });

  test('it returns yields token precision', () => {
    const poolAddress = 'abc';
    const tokenTypePrecision: TokenTypePrecision = 'yields';
    const precision = getTokenPrecision(poolAddress, tokenTypePrecision);

    expect(precision).toBe(0);
  });

  test('it returns lp tokens precision', () => {
    const poolAddress = 'abc';
    const tokenTypePrecision: TokenTypePrecision = 'lpTokens';
    const precision = getTokenPrecision(poolAddress, tokenTypePrecision);

    expect(precision).toBe(9);
  });

  test('it returns default precision', () => {
    const poolAddress = 'xyz';
    const tokenTypePrecision: TokenTypePrecision = 'principals';
    const precision = getTokenPrecision(poolAddress, tokenTypePrecision);

    expect(precision).toBe(18);
  });

  test('it returns non-zero cache without calling getConfig() when it call twice', () => {
    const poolAddress = 'abc';
    const tokenTypePrecision: TokenTypePrecision = 'backingToken';
    getTokenPrecision(poolAddress, tokenTypePrecision);
    getTokenPrecision(poolAddress, tokenTypePrecision);

    // the cache is created once the previous test has run.
    // o getConfig() will get invoked 0 times if test has been run before, or invoked once if no tests are run before
    expect((getConfig.getConfig as jest.Mock<Config, []>).mock.calls.length).toBeLessThan(2);
  });

  test('it returns zero cache without calling getConfig() when it call twice', () => {
    const poolAddress = 'abc';
    const tokenTypePrecision: TokenTypePrecision = 'yields';
    getTokenPrecision(poolAddress, tokenTypePrecision);
    getTokenPrecision(poolAddress, tokenTypePrecision);

    // the cache is created once the previous test has run.
    // o getConfig() will get invoked 0 times if test has been run before, or invoked once if no tests are run before
    expect((getConfig.getConfig as jest.Mock<Config, []>).mock.calls.length).toBeLessThan(2);
  });

  test('it returns 0 if pool address not exists', () => {
    const poolAddress = 'def';
    const tokenTypePrecision: TokenTypePrecision = 'principals';
    const precision = getTokenPrecision(poolAddress, tokenTypePrecision);

    expect(precision).toBe(0);
  });
});
