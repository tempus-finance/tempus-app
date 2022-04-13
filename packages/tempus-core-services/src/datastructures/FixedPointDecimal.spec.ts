import { BigNumber, utils } from 'ethers';
import FixedPointDecimal from './FixedPointDecimal';

describe('FixedPointDecimal', () => {
  it('constructor accepts number', () => {
    const value = 123.123;
    const precision = 10;
    const decimal = new FixedPointDecimal(value, precision);
    const expected = BigNumber.from('1231230000000');

    expect(decimal.value.eq(expected)).toBeTruthy();
    expect(decimal.precision).toBe(precision);
    expect(decimal.toString()).toEqual('123.123');
  });

  it('constructor accepts string', () => {
    const value = '123.123';
    const precision = 10;
    const decimal = new FixedPointDecimal(value, precision);
    const expected = BigNumber.from('1231230000000');

    expect(decimal.value.eq(expected)).toBeTruthy();
    expect(decimal.precision).toBe(precision);
    expect(decimal.toString()).toEqual('123.123');
  });

  it('constructor accepts BigNumber', () => {
    const value = BigNumber.from('1231230000000');
    const precision = 10;
    const decimal = new FixedPointDecimal(value, precision);
    const expected = value;

    expect(decimal.value).toBe(expected);
    expect(decimal.precision).toBe(precision);
    expect(decimal.toString()).toEqual('123.123');
  });

  [
    { value: '0', expected: 0 },
    { value: '0.0', expected: 0 },
    { value: '.123', expected: 0.123 },
    { value: '123.', expected: 123 },
    { value: '-123', expected: -123 },
  ].forEach(({ value, expected }) =>
    it(`constructor accepts ${value}`, () => {
      const decimal = new FixedPointDecimal(value);
      const result = new FixedPointDecimal(expected);

      expect(decimal.value.eq(result.value)).toBeTruthy();
      expect(decimal.precision).toEqual(result.precision);
    }),
  );

  [{ value: '.' }, { value: '' }, { value: '+123' }, { value: '1e8' }].forEach(({ value }) =>
    it(`constructor throw error for accepting ${value}`, () => {
      expect(() => new FixedPointDecimal(value)).toThrow(`Failed to parse ${value} when creating FixedPointDecimal`);
    }),
  );

  it('default precision for constructor is 18', () => {
    const value = 123.123;
    const decimal = new FixedPointDecimal(value);
    const expected = BigNumber.from('123123000000000000000');

    expect(decimal.value.eq(expected)).toBeTruthy();
    expect(decimal.precision).toBe(18);
    expect(decimal.toString()).toEqual('123.123');
  });

  [
    { value: 123.123, addend: 12.12, expected: 135.243 },
    { value: 123.123, addend: '12.12', expected: 135.243 },
    { value: 123.123, addend: new FixedPointDecimal(12.12), expected: 135.243 },
    { value: 123.123, addend: new FixedPointDecimal(12.12, 10), expected: 135.243 },
    { value: 123.123, addend: 12.12, expected: 135.243, precision: 10 },
    { value: 9876.1234, addend: 1234.9876, expected: 11111.111 },
    { value: 9876.1234, addend: '1234.9876', expected: 11111.111 },
    { value: 9876.1234, addend: new FixedPointDecimal(1234.9876), expected: 11111.111 },
    { value: 9876.1234, addend: new FixedPointDecimal(1234.9876, 10), expected: 11111.111 },
    { value: 9876.1234, addend: 1234.9876, expected: 11111.111, precision: 10 },
  ].forEach(({ value, precision, addend, expected }) =>
    it(`${value} + ${addend} should be ${expected}`, () => {
      const decimal = new FixedPointDecimal(value, precision);
      const result = new FixedPointDecimal(expected);

      expect(decimal.add(addend).toString()).toEqual(result.toString());
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

      expect(decimal.add(addend).toString()).toEqual(result.toString());
      expect(decimal.add(addend)).toEqual(result);
    });
  }

  [
    { value: 123.123, subtrahend: 12.12, expected: 111.003 },
    { value: 123.123, subtrahend: '12.12', expected: 111.003 },
    { value: 123.123, subtrahend: new FixedPointDecimal(12.12), expected: 111.003 },
    { value: 123.123, subtrahend: new FixedPointDecimal(12.12, 10), expected: 111.003 },
    { value: 123.123, subtrahend: 12.12, expected: 111.003, precision: 10 },
    { value: 9876.1234, subtrahend: 1234.9876, expected: 8641.1358 },
    { value: 9876.1234, subtrahend: '1234.9876', expected: 8641.1358 },
    { value: 9876.1234, subtrahend: new FixedPointDecimal(1234.9876), expected: 8641.1358 },
    { value: 9876.1234, subtrahend: new FixedPointDecimal(1234.9876, 10), expected: 8641.1358 },
    { value: 9876.1234, subtrahend: 1234.9876, expected: 8641.1358, precision: 10 },
  ].forEach(({ value, precision, subtrahend, expected }) =>
    it(`${value} - ${subtrahend} should be ${expected}`, () => {
      const decimal = new FixedPointDecimal(value, precision);
      const result = new FixedPointDecimal(expected);

      expect(decimal.sub(subtrahend).toString()).toEqual(result.toString());
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

      expect(decimal.sub(subtrahend).toString()).toEqual(result.toString());
      expect(decimal.sub(subtrahend)).toEqual(result);
    });
  }

  [
    { value: 123.123, multiplicand: 12.12, expected: 1492.25076 },
    { value: 123.123, multiplicand: '12.12', expected: 1492.25076 },
    { value: 123.123, multiplicand: new FixedPointDecimal(12.12), expected: 1492.25076 },
    { value: 123.123, multiplicand: new FixedPointDecimal(12.12, 10), expected: 1492.25076 },
    { value: 123.123, multiplicand: 12.12, expected: 1492.25076, precision: 10 },
    { value: 9876.1234, multiplicand: 1234.9876, expected: '12196889.93506984' },
    { value: 9876.1234, multiplicand: '1234.9876', expected: '12196889.93506984' },
    { value: 9876.1234, multiplicand: new FixedPointDecimal(1234.9876), expected: '12196889.93506984' },
    { value: 9876.1234, multiplicand: new FixedPointDecimal(1234.9876, 10), expected: '12196889.93506984' },
    { value: 9876.1234, multiplicand: 1234.9876, expected: '12196889.93506984', precision: 10 },
  ].forEach(({ value, precision, multiplicand, expected }) =>
    it(`${value} * ${multiplicand} should be ${expected}`, () => {
      const decimal = new FixedPointDecimal(value, precision);
      const result = new FixedPointDecimal(expected);

      expect(decimal.mul(multiplicand).toString()).toEqual(result.toString());
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

      expect(decimal.mul(multiplicand).toString()).toEqual(result.toString());
      expect(decimal.mul(multiplicand)).toEqual(result);
    });
  }

  [
    { value: 123.123, divisor: 12.12, expected: '10.158663366336633663' },
    { value: 123.123, divisor: '12.12', expected: '10.158663366336633663' },
    { value: 123.123, divisor: new FixedPointDecimal(12.12), expected: '10.158663366336633663' },
    { value: 123.123, divisor: new FixedPointDecimal(12.12, 10), expected: '10.158663366336633663' },
    { value: 123.123, divisor: 12.12, expected: '10.158663366336633663', precision: 10 },
    { value: 9876.1234, divisor: 1234.9876, expected: '7.996941345807844548' },
    { value: 9876.1234, divisor: '1234.9876', expected: '7.996941345807844548' },
    { value: 9876.1234, divisor: new FixedPointDecimal(1234.9876), expected: '7.996941345807844548' },
    { value: 9876.1234, divisor: new FixedPointDecimal(1234.9876, 10), expected: '7.996941345807844548' },
    { value: 9876.1234, divisor: 1234.9876, expected: '7.996941345807844548', precision: 10 },
  ].forEach(({ value, precision, divisor, expected }) =>
    it(`${value} / ${divisor} should be ${expected}`, () => {
      const decimal = new FixedPointDecimal(value, precision);
      const result = new FixedPointDecimal(expected);

      expect(decimal.div(divisor).toString()).toEqual(result.toString());
      expect(decimal.div(divisor)).toEqual(result);
    }),
  );

  for (let i = 0; i < 10; i++) {
    const value = Math.random() * 1000;
    const divisor = Math.random() * 100;
    const expected = utils
      .parseUnits(`${value}`, 18)
      .mul(BigNumber.from(10).pow(18))
      .div(utils.parseUnits(`${divisor}`, 18));

    it(`${value} / ${divisor} should be ${utils.formatUnits(expected, 18)}`, () => {
      const decimal = new FixedPointDecimal(value);
      const result = new FixedPointDecimal(expected);

      expect(decimal.div(divisor).toString()).toEqual(result.toString());
      expect(decimal.div(divisor)).toEqual(result);
    });
  }

  it('test toBigNumber() with different precision', () => {
    const value = 123.123;
    const decimal = new FixedPointDecimal(value, 10);

    expect(decimal.toBigNumber(10)).toEqual(decimal.value);
    expect(decimal.toBigNumber(6)).toEqual(BigNumber.from('123123000'));
    expect(decimal.toBigNumber(18)).toEqual(BigNumber.from('123123000000000000000'));
    expect(decimal.toBigNumber()).toEqual(BigNumber.from('123123000000000000000'));
  });

  it('test toString()', () => {
    const value = 123.123;
    const decimal = new FixedPointDecimal(value, 6);

    expect(decimal.toString()).toEqual('123.123');
  });

  it('100 should be rounded', () => {
    const decimal = new FixedPointDecimal(100);

    expect(decimal.toRounded(2)).toEqual('100.00');
    expect(decimal.toRounded()).toEqual('100');
  });

  it('100 should be truncated', () => {
    const decimal = new FixedPointDecimal(100);

    expect(decimal.toTruncated(2)).toEqual('100.00');
    expect(decimal.toTruncated()).toEqual('100');
  });

  it('123.123 should be rounded', () => {
    const decimal = new FixedPointDecimal(123.123);

    expect(decimal.toRounded(2)).toEqual('123.12');
    expect(decimal.toRounded()).toEqual('123');
  });

  it('123.123 should be truncated', () => {
    const decimal = new FixedPointDecimal(123.123);

    expect(decimal.toTruncated(2)).toEqual('123.12');
    expect(decimal.toTruncated()).toEqual('123');
  });

  it('789.789 should be rounded', () => {
    const decimal = new FixedPointDecimal(789.789);

    expect(decimal.toRounded(2)).toEqual('789.79');
    expect(decimal.toRounded()).toEqual('790');
  });

  it('789.789 should be truncated', () => {
    const decimal = new FixedPointDecimal(789.789);

    expect(decimal.toTruncated(2)).toEqual('789.78');
    expect(decimal.toTruncated()).toEqual('789');
  });

  for (let i = 0; i < 10; i++) {
    const value = Math.random() * 1000;
    const fractionDigits = Math.ceil(Math.random() * 5);
    const rounded = Math.round(value * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);
    const truncated = Math.trunc(value * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);

    it(`${value} should be rounded to ${rounded} with fraction digits ${fractionDigits}`, () => {
      const decimal = new FixedPointDecimal(value);
      const [integral, fraction = ''] = `${rounded}`.split('.');
      const expected = `${integral}.${fraction.padEnd(fractionDigits, '0')}`;

      expect(decimal.toRounded(fractionDigits)).toEqual(expected);
    });

    it(`${value} should be truncated to ${truncated}`, () => {
      const decimal = new FixedPointDecimal(value);
      const [integral, fraction = ''] = `${truncated}`.split('.');
      const expected = `${integral}.${fraction.padEnd(fractionDigits, '0')}`;

      expect(decimal.toTruncated(fractionDigits)).toEqual(expected);
    });
  }
});
