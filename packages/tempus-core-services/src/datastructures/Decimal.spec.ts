import { BigNumber, utils } from 'ethers';
import Decimal, { DEFAULT_DECIMAL_PRECISION } from './Decimal';

describe('Decimal', () => {
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
        precisionConvertFrom: 18,
        expected: BigNumber.from('123123000000000000000'),
      },
      {
        value: BigNumber.from('123123000000000'),
        precisionConvertFrom: 12,
        expected: BigNumber.from('123123000000000000000'),
      },
      {
        value: BigNumber.from('123123000000000000000000000'),
        precisionConvertFrom: 24,
        expected: BigNumber.from('123123000000000000000'),
      },
      {
        value: new Decimal(123.123),
        expected: BigNumber.from('123123000000000000000'),
      },
    ].forEach(({ value, precisionConvertFrom, expected }) =>
      it(`accepts number/string/BigNumber/Decimal: ${value.toString()}`, () => {
        let decimal: Decimal;
        if (value instanceof BigNumber) {
          decimal = new Decimal(value, precisionConvertFrom || DEFAULT_DECIMAL_PRECISION);
        } else {
          decimal = new Decimal(value);
        }

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
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal).toEqual(result);
      }),
    );

    [{ value: '.' }, { value: '' }, { value: '+123' }, { value: '1e8' }, { value: '123.0123456789012345678' }].forEach(
      ({ value }) =>
        it(`throw error for accepting ${value}`, () => {
          expect(() => new Decimal(value)).toThrow(`Failed to parse ${value} when creating Decimal`);
        }),
    );
  });

  describe('parse()', () => {
    [
      {
        value: 123.123,
        defaultValue: 789.789,
        expected: BigNumber.from('123123000000000000000'),
      },
      {
        value: '123.123',
        defaultValue: 789.789,
        expected: BigNumber.from('123123000000000000000'),
      },
      {
        value: BigNumber.from('123123000000000000000'),
        defaultValue: 789.789,
        expected: BigNumber.from('123123000000000000000'),
      },
      {
        value: new Decimal(123.123),
        defaultValue: 789.789,
        expected: BigNumber.from('123123000000000000000'),
      },
      { value: '0', defaultValue: 789.789, expected: BigNumber.from('0') },
      { value: '0.0', defaultValue: 789.789, expected: BigNumber.from('0') },
      { value: '.123', defaultValue: 789.789, expected: BigNumber.from('123000000000000000') },
      { value: '123.', defaultValue: 789.789, expected: BigNumber.from('123000000000000000000') },
      { value: '-123', defaultValue: 789.789, expected: BigNumber.from('-123000000000000000000') },
    ].forEach(({ value, defaultValue, expected }) =>
      it(`it parses ${value.toString()} successfully`, () => {
        let decimal: Decimal;
        if (value instanceof BigNumber) {
          decimal = Decimal.parse(value, BigNumber.from(0), DEFAULT_DECIMAL_PRECISION);
        } else {
          decimal = Decimal.parse(value, defaultValue);
        }

        expect(decimal.value.eq(expected)).toBeTruthy();
      }),
    );

    [
      { value: '.', defaultValue: 789.789, expected: BigNumber.from('789789000000000000000') },
      { value: '', defaultValue: 789.789, expected: BigNumber.from('789789000000000000000') },
      { value: '+123', defaultValue: 789.789, expected: BigNumber.from('789789000000000000000') },
      { value: '1e8', defaultValue: 789.789, expected: BigNumber.from('789789000000000000000') },
      { value: '123.0123456789012345678', defaultValue: 789.789, expected: BigNumber.from('789789000000000000000') },
      { value: '.', expected: BigNumber.from('0') },
      { value: '', expected: BigNumber.from('0') },
      { value: '+123', expected: BigNumber.from('0') },
      { value: '1e8', expected: BigNumber.from('0') },
      { value: '123.0123456789012345678', expected: BigNumber.from('0') },
    ].forEach(({ value, defaultValue, expected }) =>
      it(`it fails to parse ${value} and use default values`, () => {
        const decimal = Decimal.parse(value, defaultValue || 0);

        expect(decimal.value.eq(expected)).toBeTruthy();
      }),
    );
  });

  describe('add()', () => {
    [
      { value: 123.123, addend: 12.12, expected: 135.243 },
      { value: 123.123, addend: '12.12', expected: 135.243 },
      { value: 123.123, addend: new Decimal(12.12), expected: 135.243 },
      { value: 123.123, addend: 12.12, expected: 135.243, precision: 10 },
      { value: 9876.1234, addend: '1234.9876', expected: 11111.111 },
      { value: 9876.1234, addend: new Decimal(1234.9876), expected: 11111.111 },
      { value: -123.123, addend: 12.12, expected: -111.003 },
      { value: -123.123, addend: '12.12', expected: -111.003 },
      { value: -123.123, addend: new Decimal(12.12), expected: -111.003 },
    ].forEach(({ value, addend, expected }) =>
      it(`${value} + ${addend} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.add(addend)).toEqual(result);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000 - 500;
      const addend = Math.random() * 1000 - 500;
      const expected = utils.parseUnits(`${value}`, 18).add(utils.parseUnits(`${addend}`, 18));

      it(`${value} + ${addend} should be ${utils.formatUnits(expected, 18)}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected, DEFAULT_DECIMAL_PRECISION);

        expect(decimal.add(addend)).toEqual(result);
      });
    }
  });

  describe('sub()', () => {
    [
      { value: 123.123, subtrahend: 12.12, expected: 111.003 },
      { value: 123.123, subtrahend: '12.12', expected: 111.003 },
      { value: 123.123, subtrahend: new Decimal(12.12), expected: 111.003 },
      { value: 9876.1234, subtrahend: 1234.9876, expected: 8641.1358 },
      { value: 9876.1234, subtrahend: '1234.9876', expected: 8641.1358 },
      { value: 9876.1234, subtrahend: new Decimal(1234.9876), expected: 8641.1358 },
      { value: -123.123, subtrahend: 12.12, expected: -135.243 },
      { value: -123.123, subtrahend: '12.12', expected: -135.243 },
      { value: -123.123, subtrahend: new Decimal(12.12), expected: -135.243 },
    ].forEach(({ value, subtrahend, expected }) =>
      it(`${value} - ${subtrahend} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.sub(subtrahend)).toEqual(result);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const subtrahend = Math.random() * 1000;
      const expected = utils.parseUnits(`${value}`, 18).sub(utils.parseUnits(`${subtrahend}`, 18));

      it(`${value} - ${subtrahend} should be ${utils.formatUnits(expected, 18)}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected, DEFAULT_DECIMAL_PRECISION);

        expect(decimal.sub(subtrahend)).toEqual(result);
      });
    }
  });

  describe('mul()', () => {
    [
      { value: 123.123, multiplicand: 12.12, expected: 1492.25076 },
      { value: 123.123, multiplicand: '12.12', expected: 1492.25076 },
      { value: 123.123, multiplicand: new Decimal(12.12), expected: 1492.25076 },
      { value: 9876.1234, multiplicand: 1234.9876, expected: '12196889.93506984' },
      { value: 9876.1234, multiplicand: '1234.9876', expected: '12196889.93506984' },
      { value: 9876.1234, multiplicand: new Decimal(1234.9876), expected: '12196889.93506984' },
      { value: -123.123, multiplicand: 12.12, expected: -1492.25076 },
      { value: -123.123, multiplicand: '12.12', expected: -1492.25076 },
      { value: -123.123, multiplicand: new Decimal(12.12), expected: -1492.25076 },
      { value: 123.123, multiplicand: -12.12, expected: -1492.25076 },
      { value: 123.123, multiplicand: '-12.12', expected: -1492.25076 },
      { value: 123.123, multiplicand: new Decimal(-12.12), expected: -1492.25076 },
      { value: -123.123, multiplicand: -12.12, expected: 1492.25076 },
      { value: -123.123, multiplicand: '-12.12', expected: 1492.25076 },
      { value: -123.123, multiplicand: new Decimal(-12.12), expected: 1492.25076 },
    ].forEach(({ value, multiplicand, expected }) =>
      it(`${value} * ${multiplicand} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.mul(multiplicand)).toEqual(result);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000 - 500;
      const multiplicand = Math.random() * 100 - 50;
      const expected = utils
        .parseUnits(`${value}`, 18)
        .mul(utils.parseUnits(`${multiplicand}`, 18))
        .div(BigNumber.from(10).pow(18));

      it(`${value} * ${multiplicand} should be ${utils.formatUnits(expected, 18)}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected, DEFAULT_DECIMAL_PRECISION);

        expect(decimal.mul(multiplicand)).toEqual(result);
      });
    }
  });

  describe('div()', () => {
    [
      { value: 123.123, divisor: 12.12, expected: '10.158663366336633663' },
      { value: 123.123, divisor: '12.12', expected: '10.158663366336633663' },
      { value: 123.123, divisor: new Decimal(12.12), expected: '10.158663366336633663' },
      { value: 9876.1234, divisor: 1234.9876, expected: '7.996941345807844548' },
      { value: 9876.1234, divisor: '1234.9876', expected: '7.996941345807844548' },
      { value: 9876.1234, divisor: new Decimal(1234.9876), expected: '7.996941345807844548' },
      { value: -123.123, divisor: 12.12, expected: '-10.158663366336633663' },
      { value: -123.123, divisor: '12.12', expected: '-10.158663366336633663' },
      { value: -123.123, divisor: new Decimal(12.12), expected: '-10.158663366336633663' },
      { value: 123.123, divisor: -12.12, expected: '-10.158663366336633663' },
      { value: 123.123, divisor: '-12.12', expected: '-10.158663366336633663' },
      { value: 123.123, divisor: new Decimal(-12.12), expected: '-10.158663366336633663' },
      { value: -123.123, divisor: -12.12, expected: '10.158663366336633663' },
      { value: -123.123, divisor: '-12.12', expected: '10.158663366336633663' },
      { value: -123.123, divisor: new Decimal(-12.12), expected: '10.158663366336633663' },
    ].forEach(({ value, divisor, expected }) =>
      it(`${value} / ${divisor} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.div(divisor)).toEqual(result);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000 - 500;
      const divisor = Math.random() * 100 + 1;
      const expected = utils
        .parseUnits(`${value}`, 18)
        .mul(BigNumber.from(10).pow(18))
        .div(utils.parseUnits(`${divisor}`, 18));

      it(`${value} / ${divisor} should be ${utils.formatUnits(expected, 18)}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected, DEFAULT_DECIMAL_PRECISION);

        expect(decimal.div(divisor)).toEqual(result);
      });
    }
  });

  describe('abs()', () => {
    [
      { value: 123.123, expected: '123.123' },
      { value: '123.123', expected: '123.123' },
      { value: new Decimal(123.123), expected: '123.123' },
      { value: -123.123, expected: '123.123' },
      { value: '-123.123', expected: '123.123' },
      { value: new Decimal(-123.123), expected: '123.123' },
    ].forEach(({ value, expected }) =>
      it(`abs value of ${value} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.abs()).toEqual(result);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const minuend = Math.random() * 100;
      const subtrahend = Math.random() * 200;
      const value = minuend - subtrahend;
      const expected = Math.abs(value);

      it(`abs value of ${value} should be ${expected}`, () => {
        const decimal = new Decimal(value);
        const result = new Decimal(expected);

        expect(decimal.abs()).toEqual(result);
      });
    }
  });

  describe('eq()', () => {
    [
      { value: 123.123, another: 123, expected: false },
      { value: 123.123, another: '123', expected: false },
      { value: 123.123, another: new Decimal(123), expected: false },
      { value: 123.123, another: 123.123, expected: true },
      { value: 123.123, another: '123.123', expected: true },
      { value: 123.123, another: new Decimal(123.123), expected: true },
      { value: 123.123, another: 124, expected: false },
      { value: 123.123, another: '124', expected: false },
      { value: 123.123, another: new Decimal(124), expected: false },
      { value: -123.123, another: -123, expected: false },
      { value: -123.123, another: '-123', expected: false },
      { value: -123.123, another: new Decimal(-123), expected: false },
      { value: -123.123, another: -123.123, expected: true },
      { value: -123.123, another: '-123.123', expected: true },
      { value: -123.123, another: new Decimal(-123.123), expected: true },
      { value: -123.123, another: -124, expected: false },
      { value: -123.123, another: '-124', expected: false },
      { value: -123.123, another: new Decimal(-124), expected: false },
    ].forEach(({ value, another, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.equals(anotherDecimal)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 100 - 50;
      const another = Math.random() * 100 - 50;
      const expected = value === another;

      it(`${value} should ${expected ? '' : 'not'} be equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.equals(anotherDecimal)).toEqual(expected);
      });
    }
  });

  describe('lt()', () => {
    [
      { value: 123.123, another: 123, expected: false },
      { value: 123.123, another: '123', expected: false },
      { value: 123.123, another: new Decimal(123), expected: false },
      { value: 123.123, another: 123.123, expected: false },
      { value: 123.123, another: '123.123', expected: false },
      { value: 123.123, another: new Decimal(123.123), expected: false },
      { value: 123.123, another: 124, expected: true },
      { value: 123.123, another: '124', expected: true },
      { value: 123.123, another: new Decimal(124), expected: true },
      { value: -123.123, another: -123, expected: true },
      { value: -123.123, another: '-123', expected: true },
      { value: -123.123, another: new Decimal(-123), expected: true },
      { value: -123.123, another: -123.123, expected: false },
      { value: -123.123, another: '-123.123', expected: false },
      { value: -123.123, another: new Decimal(-123.123), expected: false },
      { value: -123.123, another: -124, expected: false },
      { value: -123.123, another: '-124', expected: false },
      { value: -123.123, another: new Decimal(-124), expected: false },
    ].forEach(({ value, another, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be less than ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.lt(anotherDecimal)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 100 - 50;
      const another = Math.random() * 100 - 50;
      const expected = value < another;

      it(`${value} should ${expected ? '' : 'not'} be less than ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.lt(anotherDecimal)).toEqual(expected);
      });
    }
  });

  describe('lte()', () => {
    [
      { value: 123.123, another: 123, expected: false },
      { value: 123.123, another: '123', expected: false },
      { value: 123.123, another: new Decimal(123), expected: false },
      { value: 123.123, another: 123.123, expected: true },
      { value: 123.123, another: '123.123', expected: true },
      { value: 123.123, another: new Decimal(123.123), expected: true },
      { value: 123.123, another: 124, expected: true },
      { value: 123.123, another: '124', expected: true },
      { value: 123.123, another: new Decimal(124), expected: true },
      { value: -123.123, another: -123, expected: true },
      { value: -123.123, another: '-123', expected: true },
      { value: -123.123, another: new Decimal(-123), expected: true },
      { value: -123.123, another: -123.123, expected: true },
      { value: -123.123, another: '-123.123', expected: true },
      { value: -123.123, another: new Decimal(-123.123), expected: true },
      { value: -123.123, another: -124, expected: false },
      { value: -123.123, another: '-124', expected: false },
      { value: -123.123, another: new Decimal(-124), expected: false },
    ].forEach(({ value, another, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be less than or equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.lte(anotherDecimal)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 100 - 50;
      const another = Math.random() * 100 - 50;
      const expected = value <= another;

      it(`${value} should ${expected ? '' : 'not'} be less than or equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.lte(anotherDecimal)).toEqual(expected);
      });
    }
  });

  describe('gt()', () => {
    [
      { value: 123.123, another: 123, expected: true },
      { value: 123.123, another: '123', expected: true },
      { value: 123.123, another: new Decimal(123), expected: true },
      { value: 123.123, another: 123.123, expected: false },
      { value: 123.123, another: '123.123', expected: false },
      { value: 123.123, another: new Decimal(123.123), expected: false },
      { value: 123.123, another: 124, expected: false },
      { value: 123.123, another: '124', expected: false },
      { value: 123.123, another: new Decimal(124), expected: false },
      { value: -123.123, another: -123, expected: false },
      { value: -123.123, another: '-123', expected: false },
      { value: -123.123, another: new Decimal(-123), expected: false },
      { value: -123.123, another: -123.123, expected: false },
      { value: -123.123, another: '-123.123', expected: false },
      { value: -123.123, another: new Decimal(-123.123), expected: false },
      { value: -123.123, another: -124, expected: true },
      { value: -123.123, another: '-124', expected: true },
      { value: -123.123, another: new Decimal(-124), expected: true },
    ].forEach(({ value, another, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be greater than ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.gt(anotherDecimal)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 100 - 50;
      const another = Math.random() * 100 - 50;
      const expected = value > another;

      it(`${value} should ${expected ? '' : 'not'} be greater than ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.gt(anotherDecimal)).toEqual(expected);
      });
    }
  });

  describe('gte()', () => {
    [
      { value: 123.123, another: 123, expected: true },
      { value: 123.123, another: '123', expected: true },
      { value: 123.123, another: new Decimal(123), expected: true },
      { value: 123.123, another: 123.123, expected: true },
      { value: 123.123, another: '123.123', expected: true },
      { value: 123.123, another: new Decimal(123.123), expected: true },
      { value: 123.123, another: 124, expected: false },
      { value: 123.123, another: '124', expected: false },
      { value: 123.123, another: new Decimal(124), expected: false },
      { value: -123.123, another: -123, expected: false },
      { value: -123.123, another: '-123', expected: false },
      { value: -123.123, another: new Decimal(-123), expected: false },
      { value: -123.123, another: -123.123, expected: true },
      { value: -123.123, another: '-123.123', expected: true },
      { value: -123.123, another: new Decimal(-123.123), expected: true },
      { value: -123.123, another: -124, expected: true },
      { value: -123.123, another: '-124', expected: true },
      { value: -123.123, another: new Decimal(-124), expected: true },
    ].forEach(({ value, another, expected }) =>
      it(`${value} should ${expected ? '' : 'not'} be greater than or equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.gte(anotherDecimal)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 100 - 50;
      const another = Math.random() * 100 - 50;
      const expected = value >= another;

      it(`${value} should ${expected ? '' : 'not'} be greater than or equal to ${another}`, () => {
        const decimal = new Decimal(value);
        const anotherDecimal = new Decimal(another);

        expect(decimal.gte(anotherDecimal)).toEqual(expected);
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
      {
        value: -123.123,
        precision: 10,
        expected: BigNumber.from('-1231230000000'),
      },
      {
        value: -123.123,
        precision: 6,
        expected: BigNumber.from('-123123000'),
      },
      {
        value: -123.123,
        precision: 18,
        expected: BigNumber.from('-123123000000000000000'),
      },
      {
        value: -123.123,
        precision: 20,
        expected: BigNumber.from('-12312300000000000000000'),
      },
      {
        value: -123.123,
        precision: undefined,
        expected: BigNumber.from('-123123000000000000000'),
      },
    ].forEach(({ value, precision, expected }) =>
      it(`with precision ${precision}`, () => {
        const decimal = new Decimal(value);

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
        expected: '123123',
      },
      {
        value: 789.789,
        expected: '789.789',
      },
      {
        value: 789789,
        expected: '789789',
      },
      {
        value: 0.123789,
        expected: '0.123789',
      },
      {
        value: -123.123,
        expected: '-123.123',
      },
      {
        value: -123123,
        expected: '-123123',
      },
      {
        value: -789.789,
        expected: '-789.789',
      },
      {
        value: -789789,
        expected: '-789789',
      },
      {
        value: -0.123789,
        expected: '-0.123789',
      },
    ].forEach(({ value, expected }) =>
      it(`${value} should be converted to ${expected}`, () => {
        const decimal = new Decimal(value);

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
        value: 555.555,
        fractionDigits: 2,
        expected: '555.56',
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
      {
        value: '123.012345678901234567',
        fractionDigits: 15,
        expected: '123.012345678901235',
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 17,
        expected: '123.01234567890123457',
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 18,
        expected: '123.012345678901234567',
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 20,
        expected: '123.01234567890123456700',
      },
      {
        value: -100,
        fractionDigits: 2,
        expected: '-100.00',
      },
      {
        value: -100,
        fractionDigits: undefined,
        expected: '-100',
      },
      {
        value: -123.123,
        fractionDigits: 2,
        expected: '-123.12',
      },
      {
        value: -123.123,
        fractionDigits: undefined,
        expected: '-123',
      },
      {
        value: -555.555,
        fractionDigits: 2,
        expected: '-555.55',
      },
      {
        value: -789.789,
        fractionDigits: 2,
        expected: '-789.79',
      },
      {
        value: -789.789,
        fractionDigits: undefined,
        expected: '-790',
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 15,
        expected: '-123.012345678901234',
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 17,
        expected: '-123.01234567890123457',
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 18,
        expected: '-123.012345678901234567',
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 20,
        expected: '-123.01234567890123456700',
      },
    ].forEach(({ value, fractionDigits, expected }) =>
      it(`${value} should be rounded to ${expected}`, () => {
        const decimal = new Decimal(value);

        expect(decimal.toRounded(fractionDigits)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000;
      const fractionDigits = Math.ceil(Math.random() * 5);
      const rounded = Math.round(value * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);

      it(`${value} should be rounded to ${rounded} with fraction digits ${fractionDigits}`, () => {
        const decimal = new Decimal(value);
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
      {
        value: '123.012345678901234567',
        fractionDigits: 17,
        expected: '123.01234567890123456',
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 18,
        expected: '123.012345678901234567',
      },
      {
        value: '123.012345678901234567',
        fractionDigits: 20,
        expected: '123.01234567890123456700',
      },
      {
        value: -100,
        fractionDigits: 2,
        expected: '-100.00',
      },
      {
        value: -100,
        fractionDigits: undefined,
        expected: '-100',
      },
      {
        value: -123.123,
        fractionDigits: 2,
        expected: '-123.12',
      },
      {
        value: -123.123,
        fractionDigits: undefined,
        expected: '-123',
      },
      {
        value: -789.789,
        fractionDigits: 2,
        expected: '-789.78',
      },
      {
        value: -789.789,
        fractionDigits: undefined,
        expected: '-789',
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 17,
        expected: '-123.01234567890123456',
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 18,
        expected: '-123.012345678901234567',
      },
      {
        value: '-123.012345678901234567',
        fractionDigits: 20,
        expected: '-123.01234567890123456700',
      },
    ].forEach(({ value, fractionDigits, expected }) =>
      it(`${value} should be truncated to ${expected}`, () => {
        const decimal = new Decimal(value);

        expect(decimal.toTruncated(fractionDigits)).toEqual(expected);
      }),
    );

    for (let i = 0; i < 10; i++) {
      const value = Math.random() * 1000 - 500;
      const fractionDigits = Math.ceil(Math.random() * 5);
      const truncated = Math.trunc(value * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);

      it(`${value} should be truncated to ${truncated}`, () => {
        const decimal = new Decimal(value);
        const [integral, fraction = ''] = `${truncated}`.split('.');
        const expected = `${integral}.${fraction.padEnd(fractionDigits, '0')}`;

        expect(decimal.toTruncated(fractionDigits)).toEqual(expected);
      });
    }
  });
});
