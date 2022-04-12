import { BigNumber, utils } from 'ethers';
import { div18f, mul18f } from '../utils/weiMath';
import TempusBigNumber from './TempusBigNumber';

describe('TempusBigNumber', () => {
  it('constructor accepts number', () => {
    const value = 123.123;
    const precision = 10;
    const tbignum = new TempusBigNumber(value, precision);

    expect(tbignum.value).toEqual(utils.parseUnits(`${value}`, precision));
    expect(tbignum.precision).toBe(precision);
    expect(tbignum.toString()).toEqual('123.123');
  });

  it('constructor accepts string', () => {
    const value = '123.123';
    const precision = 10;
    const tbignum = new TempusBigNumber(value, precision);

    expect(tbignum.value).toEqual(utils.parseUnits(value, precision));
    expect(tbignum.precision).toBe(precision);
    expect(tbignum.toString()).toEqual('123.123');
  });

  it('constructor accepts BigNumber', () => {
    const value = BigNumber.from('1231230000000');
    const precision = 10;
    const tbignum = new TempusBigNumber(value, precision);

    expect(tbignum.value).toBe(value);
    expect(tbignum.precision).toBe(precision);
    expect(tbignum.toString()).toEqual('123.123');
  });

  [
    { value: '0' },
    { value: '0.0' },
    { value: '.' },
    { value: '.123' },
    { value: '123.' },
    { value: '' },
    { value: '-123' },
  ].forEach(({ value }) =>
    it(`constructor accepts ${value}`, () => {
      const tbignum = new TempusBigNumber(value);

      expect(tbignum).not.toBeNull();
    }),
  );

  it('default precision for constructor is 18', () => {
    const value = 123.123;
    const tbignum = new TempusBigNumber(value);

    expect(tbignum.value).toEqual(utils.parseUnits(`${value}`, 18));
    expect(tbignum.precision).toBe(18);
    expect(tbignum.toString()).toEqual('123.123');
  });

  [
    { value: 123.123, addend: 12.12, expected: 135.243 },
    { value: 123.123, addend: '12.12', expected: 135.243 },
    { value: 123.123, addend: new TempusBigNumber(12.12), expected: 135.243 },
    { value: 123.123, addend: new TempusBigNumber(12.12, 10), expected: 135.243 },
    { value: 123.123, addend: 12.12, expected: 135.243, precision: 10 },
    { value: 9876.1234, addend: 1234.9876, expected: 11111.111 },
    { value: 9876.1234, addend: '1234.9876', expected: 11111.111 },
    { value: 9876.1234, addend: new TempusBigNumber(1234.9876), expected: 11111.111 },
    { value: 9876.1234, addend: new TempusBigNumber(1234.9876, 10), expected: 11111.111 },
    { value: 9876.1234, addend: 1234.9876, expected: 11111.111, precision: 10 },
  ].forEach(({ value, precision, addend, expected }) =>
    it(`${value} + ${addend} should be ${expected}`, () => {
      const tbignum = new TempusBigNumber(value, precision);
      const result = new TempusBigNumber(expected);

      expect(tbignum.add(addend).toString()).toEqual(result.toString());
      expect(tbignum.add(addend)).toEqual(result);
    }),
  );

  for (let i = 0; i < 10; i++) {
    const value = Math.random() * 1000;
    const addend = Math.random() * 100;
    const expected = utils.parseUnits(`${value}`, 18).add(utils.parseUnits(`${addend}`, 18));

    it(`${value} + ${addend} should be ${utils.formatUnits(expected, 18)}`, () => {
      const tbignum = new TempusBigNumber(value);
      const result = new TempusBigNumber(expected);

      expect(tbignum.add(addend).toString()).toEqual(result.toString());
      expect(tbignum.add(addend)).toEqual(result);
    });
  }

  [
    { value: 123.123, subtrahend: 12.12, expected: 111.003 },
    { value: 123.123, subtrahend: '12.12', expected: 111.003 },
    { value: 123.123, subtrahend: new TempusBigNumber(12.12), expected: 111.003 },
    { value: 123.123, subtrahend: new TempusBigNumber(12.12, 10), expected: 111.003 },
    { value: 123.123, subtrahend: 12.12, expected: 111.003, precision: 10 },
    { value: 9876.1234, subtrahend: 1234.9876, expected: 8641.1358 },
    { value: 9876.1234, subtrahend: '1234.9876', expected: 8641.1358 },
    { value: 9876.1234, subtrahend: new TempusBigNumber(1234.9876), expected: 8641.1358 },
    { value: 9876.1234, subtrahend: new TempusBigNumber(1234.9876, 10), expected: 8641.1358 },
    { value: 9876.1234, subtrahend: 1234.9876, expected: 8641.1358, precision: 10 },
  ].forEach(({ value, precision, subtrahend, expected }) =>
    it(`${value} - ${subtrahend} should be ${expected}`, () => {
      const tbignum = new TempusBigNumber(value, precision);
      const result = new TempusBigNumber(expected);

      expect(tbignum.sub(subtrahend).toString()).toEqual(result.toString());
      expect(tbignum.sub(subtrahend)).toEqual(result);
    }),
  );

  for (let i = 0; i < 10; i++) {
    const value = Math.random() * 1000 + 100;
    const subtrahend = Math.random() * 100;
    const expected = utils.parseUnits(`${value}`, 18).sub(utils.parseUnits(`${subtrahend}`, 18));

    it(`${value} - ${subtrahend} should be ${utils.formatUnits(expected, 18)}`, () => {
      const tbignum = new TempusBigNumber(value);
      const result = new TempusBigNumber(expected);

      expect(tbignum.sub(subtrahend).toString()).toEqual(result.toString());
      expect(tbignum.sub(subtrahend)).toEqual(result);
    });
  }

  [
    { value: 123.123, multiplicand: 12.12, expected: 1492.25076 },
    { value: 123.123, multiplicand: '12.12', expected: 1492.25076 },
    { value: 123.123, multiplicand: new TempusBigNumber(12.12), expected: 1492.25076 },
    { value: 123.123, multiplicand: new TempusBigNumber(12.12, 10), expected: 1492.25076 },
    { value: 123.123, multiplicand: 12.12, expected: 1492.25076, precision: 10 },
    { value: 9876.1234, multiplicand: 1234.9876, expected: '12196889.93506984' },
    { value: 9876.1234, multiplicand: '1234.9876', expected: '12196889.93506984' },
    { value: 9876.1234, multiplicand: new TempusBigNumber(1234.9876), expected: '12196889.93506984' },
    { value: 9876.1234, multiplicand: new TempusBigNumber(1234.9876, 10), expected: '12196889.93506984' },
    { value: 9876.1234, multiplicand: 1234.9876, expected: '12196889.93506984', precision: 10 },
  ].forEach(({ value, precision, multiplicand, expected }) =>
    it(`${value} * ${multiplicand} should be ${expected}`, () => {
      const tbignum = new TempusBigNumber(value, precision);
      const result = new TempusBigNumber(expected);

      expect(tbignum.mul(multiplicand).toString()).toEqual(result.toString());
      expect(tbignum.mul(multiplicand)).toEqual(result);
    }),
  );

  for (let i = 0; i < 10; i++) {
    const value = Math.random() * 1000;
    const multiplicand = Math.random() * 100;
    const expected = mul18f(utils.parseUnits(`${value}`, 18), utils.parseUnits(`${multiplicand}`, 18), 18);

    it(`${value} * ${multiplicand} should be ${utils.formatUnits(expected, 18)}`, () => {
      const tbignum = new TempusBigNumber(value);
      const result = new TempusBigNumber(expected);

      expect(tbignum.mul(multiplicand).toString()).toEqual(result.toString());
      expect(tbignum.mul(multiplicand)).toEqual(result);
    });
  }

  [
    { value: 123.123, divisor: 12.12, expected: '10.158663366336633663' },
    { value: 123.123, divisor: '12.12', expected: '10.158663366336633663' },
    { value: 123.123, divisor: new TempusBigNumber(12.12), expected: '10.158663366336633663' },
    { value: 123.123, divisor: new TempusBigNumber(12.12, 10), expected: '10.158663366336633663' },
    { value: 123.123, divisor: 12.12, expected: '10.158663366336633663', precision: 10 },
    { value: 9876.1234, divisor: 1234.9876, expected: '7.996941345807844548' },
    { value: 9876.1234, divisor: '1234.9876', expected: '7.996941345807844548' },
    { value: 9876.1234, divisor: new TempusBigNumber(1234.9876), expected: '7.996941345807844548' },
    { value: 9876.1234, divisor: new TempusBigNumber(1234.9876, 10), expected: '7.996941345807844548' },
    { value: 9876.1234, divisor: 1234.9876, expected: '7.996941345807844548', precision: 10 },
  ].forEach(({ value, precision, divisor, expected }) =>
    it(`${value} / ${divisor} should be ${expected}`, () => {
      const tbignum = new TempusBigNumber(value, precision);
      const result = new TempusBigNumber(expected);

      expect(tbignum.div(divisor).toString()).toEqual(result.toString());
      expect(tbignum.div(divisor)).toEqual(result);
    }),
  );

  for (let i = 0; i < 10; i++) {
    const value = Math.random() * 1000;
    const divisor = Math.random() * 100;
    const expected = div18f(utils.parseUnits(`${value}`, 18), utils.parseUnits(`${divisor}`, 18), 18);

    it(`${value} / ${divisor} should be ${utils.formatUnits(expected, 18)}`, () => {
      const tbignum = new TempusBigNumber(value);
      const result = new TempusBigNumber(expected);

      expect(tbignum.div(divisor).toString()).toEqual(result.toString());
      expect(tbignum.div(divisor)).toEqual(result);
    });
  }

  it('test toBigNumber() with different precision', () => {
    const value = 123.123;
    const tbignum = new TempusBigNumber(value, 10);

    expect(tbignum.toBigNumber(10)).toEqual(tbignum.value);
    expect(tbignum.toBigNumber(6)).toEqual(BigNumber.from('123123000'));
    expect(tbignum.toBigNumber(18)).toEqual(BigNumber.from('123123000000000000000'));
    expect(tbignum.toBigNumber()).toEqual(BigNumber.from('123123000000000000000'));
  });

  it('test toNumber()', () => {
    const value = 123.123;
    const tbignum = new TempusBigNumber(value, 6);

    expect(tbignum.toNumber()).toEqual(123123000);
  });

  it('test toString()', () => {
    const value = 123.123;
    const tbignum = new TempusBigNumber(value, 6);

    expect(tbignum.toString()).toEqual('123.123');
  });

  it('100 should be rounded to 100', () => {
    const tbignum = new TempusBigNumber(100);

    expect(tbignum.toFixed(0, true)).toEqual('100');
  });

  it('100 should be truncated to 100', () => {
    const tbignum = new TempusBigNumber(100);

    expect(tbignum.toFixed(0)).toEqual('100');
    expect(tbignum.toFixed()).toEqual('100');
  });

  it('123.123 should be rounded to 123', () => {
    const tbignum = new TempusBigNumber(123.123);

    expect(tbignum.toFixed(0, true)).toEqual('123');
  });

  it('123.123 should be truncated to 123', () => {
    const tbignum = new TempusBigNumber(123.123);

    expect(tbignum.toFixed(0)).toEqual('123');
    expect(tbignum.toFixed()).toEqual('123');
  });

  it('789.789 should be rounded to 790', () => {
    const tbignum = new TempusBigNumber(789.789);

    expect(tbignum.toFixed(0, true)).toEqual('790');
  });

  it('789.789 should be truncated to 789', () => {
    const tbignum = new TempusBigNumber(789.789);

    expect(tbignum.toFixed(0)).toEqual('789');
    expect(tbignum.toFixed()).toEqual('789');
  });

  for (let i = 0; i < 10; i++) {
    const value = Math.random() * 1000;
    const fractionDigits = Math.ceil(Math.random() * 5);
    const rounded = Math.round(value * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);
    const truncated = Math.trunc(value * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);

    it(`${value} should be rounded to ${rounded} with fraction digits ${fractionDigits}`, () => {
      const tbignum = new TempusBigNumber(value);
      const [integral, fraction = ''] = `${rounded}`.split('.');
      const expected = `${integral}.${fraction.padEnd(fractionDigits, '0')}`;

      expect(tbignum.toFixed(fractionDigits, true)).toEqual(expected);
    });

    it(`${value} should be truncated to ${truncated}`, () => {
      const tbignum = new TempusBigNumber(value);
      const [integral, fraction = ''] = `${truncated}`.split('.');
      const expected = `${integral}.${fraction.padEnd(fractionDigits, '0')}`;

      expect(tbignum.toFixed(fractionDigits)).toEqual(expected);
    });
  }
});
