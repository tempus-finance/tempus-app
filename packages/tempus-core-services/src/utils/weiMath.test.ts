import { ethers } from 'ethers';
import { mul18f, div18f, increasePrecision } from './weiMath';

describe('weiMath', () => {
  describe('mul18f without precision', () => {
    [
      { multiplier: ethers.utils.parseUnits('2'), multiplicand: ethers.utils.parseUnits('3'), product: '6.0' },
      { multiplier: ethers.utils.parseUnits('5.0'), multiplicand: ethers.utils.parseUnits('3'), product: '15.0' },
      { multiplier: ethers.utils.parseUnits('1.23'), multiplicand: ethers.utils.parseUnits('3.57'), product: '4.3911' },
      { multiplier: ethers.utils.parseUnits('-1.1'), multiplicand: ethers.utils.parseUnits('10'), product: '-11.0' },
      { multiplier: ethers.utils.parseUnits('-4'), multiplicand: ethers.utils.parseUnits('-2'), product: '8.0' },
      {
        multiplier: ethers.utils.parseUnits('-9.5'),
        multiplicand: ethers.utils.parseUnits('-5.555'),
        product: '52.7725',
      },
    ].forEach(item => {
      const { multiplier, multiplicand, product } = item;

      test(`it returns '${product}' when multiplier is '${multiplier}' and multiplicand is '${multiplicand}'`, () => {
        const result = ethers.utils.formatUnits(mul18f(multiplier, multiplicand));
        expect(result).toEqual(product);
      });
    });
  });

  describe('mul18f with precision', () => {
    [
      {
        multiplier: ethers.utils.parseUnits('2'),
        multiplicand: ethers.utils.parseUnits('3'),
        precision: 18,
        product: '6.0',
      },
      {
        multiplier: ethers.utils.parseUnits('2'),
        multiplicand: ethers.utils.parseUnits('3'),
        precision: 15,
        product: '6000.0',
      },
      {
        multiplier: ethers.utils.parseUnits('2'),
        multiplicand: ethers.utils.parseUnits('3'),
        precision: 12,
        product: '6000000.0',
      },
      {
        multiplier: ethers.utils.parseUnits('2'),
        multiplicand: ethers.utils.parseUnits('3'),
        precision: 9,
        product: '6000000000.0',
      },
      {
        multiplier: ethers.utils.parseUnits('2'),
        multiplicand: ethers.utils.parseUnits('3'),
        precision: 6,
        product: '6000000000000.0',
      },
      {
        multiplier: ethers.utils.parseUnits('-9.5'),
        multiplicand: ethers.utils.parseUnits('-5.555'),
        product: '52.7725',
      },
    ].forEach(item => {
      const { multiplier, multiplicand, precision, product } = item;

      test(`it returns '${product}' when multiplier is '${multiplier}', multiplicand is '${multiplicand}' and precision is '${precision}'`, () => {
        const result = ethers.utils.formatUnits(mul18f(multiplier, multiplicand, precision));
        expect(result).toEqual(product);
      });
    });
  });

  describe('div18f without precision', () => {
    [
      { dividend: ethers.utils.parseUnits('10'), divisor: ethers.utils.parseUnits('2'), fraction: '5.0' },
      { dividend: ethers.utils.parseUnits('6.0'), divisor: ethers.utils.parseUnits('3'), fraction: '2.0' },
      { dividend: ethers.utils.parseUnits('2.222'), divisor: ethers.utils.parseUnits('1.1'), fraction: '2.02' },
      { dividend: ethers.utils.parseUnits('-4.4'), divisor: ethers.utils.parseUnits('2.2'), fraction: '-2.0' },
      {
        dividend: ethers.utils.parseUnits('-10.008'),
        divisor: ethers.utils.parseUnits('-0.2'),
        fraction: '50.04',
      },
    ].forEach(item => {
      const { dividend, divisor, fraction } = item;

      test(`it returns '${fraction}' when dividend is '${dividend}' and divisor is '${divisor}'`, () => {
        const result = ethers.utils.formatUnits(div18f(dividend, divisor));
        expect(result).toEqual(fraction);
      });
    });
  });

  describe('div18f with precision', () => {
    [
      {
        dividend: ethers.utils.parseUnits('10'),
        divisor: ethers.utils.parseUnits('2'),
        precision: 18,
        fraction: '5.0',
      },
      {
        dividend: ethers.utils.parseUnits('10'),
        divisor: ethers.utils.parseUnits('2'),
        precision: 15,
        fraction: '0.005',
      },
      {
        dividend: ethers.utils.parseUnits('10'),
        divisor: ethers.utils.parseUnits('2'),
        precision: 12,
        fraction: '0.000005',
      },
      {
        dividend: ethers.utils.parseUnits('10'),
        divisor: ethers.utils.parseUnits('2'),
        precision: 9,
        fraction: '0.000000005',
      },
      {
        dividend: ethers.utils.parseUnits('10'),
        divisor: ethers.utils.parseUnits('2'),
        precision: 6,
        fraction: '0.000000000005',
      },
    ].forEach(item => {
      const { dividend, divisor, precision, fraction } = item;

      test(`it returns '${fraction}' when dividend is '${dividend}', divisor is '${divisor}' and precision is '${precision}'`, () => {
        const result = ethers.utils.formatUnits(div18f(dividend, divisor, precision));
        expect(result).toEqual(fraction);
      });
    });
  });

  describe('increasePrecision()', () => {
    [
      { value: ethers.utils.parseUnits('1.234'), precision: 1, result: '12.34' },
      { value: ethers.utils.parseUnits('1.234'), precision: 2, result: '123.4' },
      { value: ethers.utils.parseUnits('1.234'), precision: 3, result: '1234.0' },
      { value: ethers.utils.parseUnits('1.234'), precision: 4, result: '12340.0' },
      { value: ethers.utils.parseUnits('1.234'), precision: 5, result: '123400.0' },
      { value: ethers.utils.parseUnits('1.234'), precision: 6, result: '1234000.0' },
      { value: ethers.utils.parseUnits('1.234'), precision: 7, result: '12340000.0' },
      { value: ethers.utils.parseUnits('1.234'), precision: 8, result: '123400000.0' },
      { value: ethers.utils.parseUnits('1.234'), precision: 9, result: '1234000000.0' },
      { value: ethers.utils.parseUnits('1.234'), precision: 10, result: '12340000000.0' },
      { value: ethers.utils.parseUnits('1.234'), precision: 11, result: '123400000000.0' },
    ].forEach(item => {
      const { value, precision, result } = item;

      test(`it returns '${result}' when ${value} increases precision ${precision}`, () => {
        const formattedResult = ethers.utils.formatUnits(increasePrecision(value, precision));

        expect(result).toEqual(formattedResult);
      });
    });

    for (let i = 0; i < 10; i++) {
      const value = ethers.utils.parseUnits(Math.random().toString().substring(0, 6));
      const precision = Math.round(Math.random() * 18);
      const result = value.mul(Math.pow(10, precision).toString());

      test(`it returns '${result}' when ${value} increases precision ${precision}`, () => {
        expect(result).toEqual(increasePrecision(value, precision));
      });
    }
  });
});
