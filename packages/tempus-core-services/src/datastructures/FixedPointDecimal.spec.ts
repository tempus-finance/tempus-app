import { BigNumber, utils } from 'ethers';
import FixedPointDecimal from './FixedPointDecimal';

describe('FixedPointDecimal', () => {
  describe('constructor', () => {
    [
      {
        value: 123.123,
        expected: BigNumber.from('123123000000000000000'),
      },
      {
        value: '123.123',
        expected: BigNumber.from('123123000000000000000'),
      },
      {
        value: BigNumber.from('123123000000000000000'),
        expected: BigNumber.from('123123000000000000000'),
      },
      {
        value: new FixedPointDecimal(123.123),
        expected: BigNumber.from('123123000000000000000'),
      },
    ].forEach(({ value, expected }) =>
      it(`accepts number/string/BigNumber/FixedPointDecimal: ${value.toString()}`, () => {
        const decimal = new FixedPointDecimal(value);

        expect(decimal.value.eq(expected)).toBeTruthy();
      }),
    );

    [
      { value: '0', expected: 0 },
      { value: '0.0', expected: 0 },
      { value: '.123', expected: 0.123 },
      { value: '123.', expected: 123 },
      { value: '-123', expected: -123 },
    ].forEach(({ value, expected }) =>
      it(`accepts value ${value}`, () => {
        const decimal = new FixedPointDecimal(value);
        const result = new FixedPointDecimal(expected);

        expect(decimal).toEqual(result);
      }),
    );

    [{ value: '.' }, { value: '' }, { value: '+123' }, { value: '1e8' }].forEach(({ value }) =>
      it(`throw error for accepting ${value}`, () => {
        expect(() => new FixedPointDecimal(value)).toThrow(`Failed to parse ${value} when creating FixedPointDecimal`);
      }),
    );
  });

  describe('add()', () => {
    [
      { value: 123.123, addend: 12.12, expected: 135.243 },
      { value: 123.123, addend: '12.12', expected: 135.243 },
      { value: 123.123, addend: new FixedPointDecimal(12.12), expected: 135.243 },
      { value: 123.123, addend: 12.12, expected: 135.243, precision: 10 },
      { value: 9876.1234, addend: '1234.9876', expected: 11111.111 },
      { value: 9876.1234, addend: new FixedPointDecimal(1234.9876), expected: 11111.111 },
    ].forEach(({ value, addend, expected }) =>
      it(`${value} + ${addend} should be ${expected}`, () => {
        const decimal = new FixedPointDecimal(value);
        const result = new FixedPointDecimal(expected);

        expect(decimal.add(addend)).toEqual(result);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const addend = Math.random() * 100;
      const expected = utils.parseUnits(`${value}`, 18).add(utils.parseUnits(`${addend}`, 18));

      it(`${value} + ${addend} should be ${utils.formatUnits(expected, 18)}`, () => {
        const decimal = new FixedPointDecimal(value);
        const result = new FixedPointDecimal(expected);

        expect(decimal.add(addend)).toEqual(result);
      });
    }
  });

  describe('sub()', () => {
    [
      { value: 123.123, subtrahend: 12.12, expected: 111.003 },
      { value: 123.123, subtrahend: '12.12', expected: 111.003 },
      { value: 123.123, subtrahend: new FixedPointDecimal(12.12), expected: 111.003 },
      { value: 9876.1234, subtrahend: 1234.9876, expected: 8641.1358 },
      { value: 9876.1234, subtrahend: '1234.9876', expected: 8641.1358 },
      { value: 9876.1234, subtrahend: new FixedPointDecimal(1234.9876), expected: 8641.1358 },
    ].forEach(({ value, subtrahend, expected }) =>
      it(`${value} - ${subtrahend} should be ${expected}`, () => {
        const decimal = new FixedPointDecimal(value);
        const result = new FixedPointDecimal(expected);

        expect(decimal.sub(subtrahend)).toEqual(result);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000 + 100;
      const subtrahend = Math.random() * 100;
      const expected = utils.parseUnits(`${value}`, 18).sub(utils.parseUnits(`${subtrahend}`, 18));

      it(`${value} - ${subtrahend} should be ${utils.formatUnits(expected, 18)}`, () => {
        const decimal = new FixedPointDecimal(value);
        const result = new FixedPointDecimal(expected);

        expect(decimal.sub(subtrahend)).toEqual(result);
      });
    }
  });

  describe('mul()', () => {
    [
      { value: 123.123, multiplicand: 12.12, expected: 1492.25076 },
      { value: 123.123, multiplicand: '12.12', expected: 1492.25076 },
      { value: 123.123, multiplicand: new FixedPointDecimal(12.12), expected: 1492.25076 },
      { value: 9876.1234, multiplicand: 1234.9876, expected: '12196889.93506984' },
      { value: 9876.1234, multiplicand: '1234.9876', expected: '12196889.93506984' },
      { value: 9876.1234, multiplicand: new FixedPointDecimal(1234.9876), expected: '12196889.93506984' },
    ].forEach(({ value, multiplicand, expected }) =>
      it(`${value} * ${multiplicand} should be ${expected}`, () => {
        const decimal = new FixedPointDecimal(value);
        const result = new FixedPointDecimal(expected);

        expect(decimal.mul(multiplicand)).toEqual(result);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const multiplicand = Math.random() * 100;
      const expected = utils
        .parseUnits(`${value}`, 18)
        .mul(utils.parseUnits(`${multiplicand}`, 18))
        .div(BigNumber.from(10).pow(18));

      it(`${value} * ${multiplicand} should be ${utils.formatUnits(expected, 18)}`, () => {
        const decimal = new FixedPointDecimal(value);
        const result = new FixedPointDecimal(expected);

        expect(decimal.mul(multiplicand)).toEqual(result);
      });
    }
  });

  describe('div()', () => {
    [
      { value: 123.123, divisor: 12.12, expected: '10.158663366336633663' },
      { value: 123.123, divisor: '12.12', expected: '10.158663366336633663' },
      { value: 123.123, divisor: new FixedPointDecimal(12.12), expected: '10.158663366336633663' },
      { value: 9876.1234, divisor: 1234.9876, expected: '7.996941345807844548' },
      { value: 9876.1234, divisor: '1234.9876', expected: '7.996941345807844548' },
      { value: 9876.1234, divisor: new FixedPointDecimal(1234.9876), expected: '7.996941345807844548' },
    ].forEach(({ value, divisor, expected }) =>
      it(`${value} / ${divisor} should be ${expected}`, () => {
        const decimal = new FixedPointDecimal(value);
        const result = new FixedPointDecimal(expected);

        expect(decimal.div(divisor)).toEqual(result);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const divisor = Math.random() * 100 + 1;
      const expected = utils
        .parseUnits(`${value}`, 18)
        .mul(BigNumber.from(10).pow(18))
        .div(utils.parseUnits(`${divisor}`, 18));

      it(`${value} / ${divisor} should be ${utils.formatUnits(expected, 18)}`, () => {
        const decimal = new FixedPointDecimal(value);
        const result = new FixedPointDecimal(expected);

        expect(decimal.div(divisor)).toEqual(result);
      });
    }
  });

  describe('toBigNumber()', () => {
    [
      {
        value: 123.123,
        precision: 10,
        expected: BigNumber.from('1231230000000'),
      },
      {
        value: 123.123,
        precision: 6,
        expected: BigNumber.from('123123000'),
      },
      {
        value: 123.123,
        precision: 18,
        expected: BigNumber.from('123123000000000000000'),
      },
      {
        value: 123.123,
        precision: 20,
        expected: BigNumber.from('12312300000000000000000'),
      },
      {
        value: 123.123,
        precision: undefined,
        expected: BigNumber.from('123123000000000000000'),
      },
    ].forEach(({ value, precision, expected }) =>
      it(`with precision ${precision}`, () => {
        const decimal = new FixedPointDecimal(value);

        expect(decimal.toBigNumber(precision)).toEqual(expected);
      }),
    );
  });

  describe('toString()', () => {
    [
      {
        value: 123.123,
        expected: '123.123',
      },
      {
        value: 123123,
        expected: '123123.0',
      },
      {
        value: 789.789,
        expected: '789.789',
      },
      {
        value: 789789,
        expected: '789789.0',
      },
      {
        value: 0.123789,
        expected: '0.123789',
      },
    ].forEach(({ value, expected }) =>
      it(`${value} should be converted to ${expected}`, () => {
        const decimal = new FixedPointDecimal(value);

        expect(decimal.toString()).toEqual(expected);
      }),
    );
  });

  describe('toRounded()', () => {
    [
      {
        value: 100,
        fractionDigits: 2,
        expected: '100.00',
      },
      {
        value: 100,
        fractionDigits: undefined,
        expected: '100',
      },
      {
        value: 123.123,
        fractionDigits: 2,
        expected: '123.12',
      },
      {
        value: 123.123,
        fractionDigits: undefined,
        expected: '123',
      },
      {
        value: 789.789,
        fractionDigits: 2,
        expected: '789.79',
      },
      {
        value: 789.789,
        fractionDigits: undefined,
        expected: '790',
      },
    ].forEach(({ value, fractionDigits, expected }) =>
      it(`${value} should be rounded to ${expected}`, () => {
        const decimal = new FixedPointDecimal(value);

        expect(decimal.toRounded(fractionDigits)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const fractionDigits = Math.ceil(Math.random() * 5);
      const rounded = Math.round(value * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);

      it(`${value} should be rounded to ${rounded} with fraction digits ${fractionDigits}`, () => {
        const decimal = new FixedPointDecimal(value);
        const [integral, fraction = ''] = `${rounded}`.split('.');
        const expected = `${integral}.${fraction.padEnd(fractionDigits, '0')}`;

        expect(decimal.toRounded(fractionDigits)).toEqual(expected);
      });
    }
  });

  describe('toTruncated()', () => {
    [
      {
        value: 100,
        fractionDigits: 2,
        expected: '100.00',
      },
      {
        value: 100,
        fractionDigits: undefined,
        expected: '100',
      },
      {
        value: 123.123,
        fractionDigits: 2,
        expected: '123.12',
      },
      {
        value: 123.123,
        fractionDigits: undefined,
        expected: '123',
      },
      {
        value: 789.789,
        fractionDigits: 2,
        expected: '789.78',
      },
      {
        value: 789.789,
        fractionDigits: undefined,
        expected: '789',
      },
    ].forEach(({ value, fractionDigits, expected }) =>
      it(`${value} should be truncated to ${expected}`, () => {
        const decimal = new FixedPointDecimal(value);

        expect(decimal.toTruncated(fractionDigits)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const fractionDigits = Math.ceil(Math.random() * 5);
      const truncated = Math.trunc(value * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);

      it(`${value} should be truncated to ${truncated}`, () => {
        const decimal = new FixedPointDecimal(value);
        const [integral, fraction = ''] = `${truncated}`.split('.');
        const expected = `${integral}.${fraction.padEnd(fractionDigits, '0')}`;

        expect(decimal.toTruncated(fractionDigits)).toEqual(expected);
      });
    }
  });
});
