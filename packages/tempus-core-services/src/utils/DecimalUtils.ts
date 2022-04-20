import Decimal, { Numberish } from '../datastructures/Decimal';
import { reverseString } from './reverseString';

const MULTIPLIER_LOOKUP = [
  { value: '1000000000000000000', symbol: 'Q' },
  { value: '1000000000000000', symbol: 'q' },
  { value: '1000000000000', symbol: 'T' },
  { value: '1000000000', symbol: 'B' },
  { value: '1000000', symbol: 'M' },
  { value: '1000', symbol: 'k' },
];

export default class DecimalUtils {
  // round for multiplier (e.g. 9876 -> 9.88k), trauncate for fraction (e.g. 9.876 -> 9.87)
  static formatWithMultiplier(value: Numberish, fractionDigits: number = 0): string {
    const decimal = new Decimal(value);
    const decimalAbs = decimal.abs();
    const multiplier = MULTIPLIER_LOOKUP.find(item => decimalAbs.gte(item.value));

    return multiplier
      ? `${decimal.div(multiplier.value).toRounded(fractionDigits)}${multiplier.symbol}`
      : decimal.toTruncated(fractionDigits);
  }

  // trauncate for currency (e.g. $9,999.876 -> $9,999.87)
  static formatToCurrency(value: Numberish, fractionDigits: number = 2, symbol: string = ''): string {
    const decimal = new Decimal(value);
    const str = decimal.toTruncated(fractionDigits);
    const [integerPart, fractionalPart] = str.split('.');

    const integerPartReversed = reverseString(integerPart);
    const integerPartReversedSplitted = integerPartReversed.match(/.{1,3}/g) as string[];
    const integerPartReversedSeparatorsAdded = integerPartReversedSplitted.join(',');
    const integerPartSeparatorsAdded = reverseString(integerPartReversedSeparatorsAdded);

    return fractionDigits > 0
      ? `${symbol}${integerPartSeparatorsAdded}.${fractionalPart}`
      : `${symbol}${integerPartSeparatorsAdded}`;
  }

  // roundValue to determine whether the percentage should be rounded
  static formatPercentage(value: Numberish, fractionDigits: number = 2, roundValue: boolean = false): string {
    const decimal = new Decimal(value);
    const decimalIn100 = decimal.mul(100);
    const truncatedDecimalIn100 = roundValue
      ? decimalIn100.toRounded(fractionDigits)
      : decimalIn100.toTruncated(fractionDigits);

    return `${truncatedDecimalIn100}%`;
  }
}
