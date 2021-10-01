import { reverseString } from '../utils/reverse-string';

const multiplierLookup = [
  { value: 1e18, symbol: 'Q' },
  { value: 1e15, symbol: 'q' },
  { value: 1e12, symbol: 'T' },
  { value: 1e9, symbol: 'B' },
  { value: 1e6, symbol: 'M' },
  { value: 1e3, symbol: 'k' },
  { value: 1, symbol: '' },
];

const regex = /\.0+$|(\.[0-9]*[1-9])0+$/;

class NumberUtils {
  static formatWithMultiplier(value: any, precision: number = 0): string {
    const sanitizedValue = Number(value);
    const multiplier = multiplierLookup.find(item => Math.abs(sanitizedValue) >= item.value);

    return multiplier
      ? `${(sanitizedValue / multiplier.value).toFixed(precision).replace(regex, '$1')}${multiplier.symbol}`
      : '0';
  }

  static formatToCurrency(value: string, numberOfDecimals?: number, symbol?: string): string {
    if (!value) {
      return `${symbol || ''}0`;
    }

    const [integerPart, fractionalPart] = value.split('.');

    let integerPartSeparatorsAdded: string;

    const integerPartReversed = reverseString(integerPart);
    const integerPartReversedSplitted = integerPartReversed.match(/.{1,3}/g);
    if (integerPartReversedSplitted) {
      const integerPartReversedSeparatorsAdded = integerPartReversedSplitted.join(',');
      integerPartSeparatorsAdded = reverseString(integerPartReversedSeparatorsAdded);
    } else {
      integerPartSeparatorsAdded = '';
    }

    const fractionPartFormatted = fractionalPart ? fractionalPart.slice(0, numberOfDecimals ?? 2) : '';

    return `${symbol || ''}${integerPartSeparatorsAdded}${fractionPartFormatted ? `.${fractionPartFormatted}` : ''}`;
  }

  static formatPercentage(value: any, precision: number = 2, roundValue?: boolean): string {
    const sanitizedValue = Number(value);

    if (sanitizedValue === undefined) {
      return '';
    }

    const sanitizedValuePer100 = sanitizedValue * 100;

    if (roundValue) {
      return `${sanitizedValuePer100.toFixed(precision)}%`;
    }

    const matchingString = '^-?\\d+(?:\\.\\d{0,' + precision + '})?';
    const regEx = new RegExp(matchingString);

    const sanitizedValueString = sanitizedValuePer100.toString();
    const parsedString = sanitizedValueString.match(regEx);
    return parsedString ? `${parsedString[0]}%` : '';
  }
}

export default NumberUtils;
