import { TokenTypePrecision } from '../interfaces/TokenPrecision';
import getTokenPrecision from './getTokenPrecision';

jest.mock('./getConfig');
const getConfig = jest.requireMock('./getConfig').default;

describe('getTokenPrecision()', () => {
  beforeEach(() => {
    getConfig.mockImplementation(() => {
      return {
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
      };
    });
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
});
