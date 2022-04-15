import { isZeroString } from './isZeroString';
import { reverseString } from './reverseString';

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

export class NumberUtils {
  static formatWithMultiplier(value: number | string, precision = 0): string {
    const sanitizedValue = Number(value);
    const multiplier = multiplierLookup.find(item => Math.abs(sanitizedValue) >= item.value);

    if (sanitizedValue > 0 && sanitizedValue < 1) {
      const sanitizedValueString = sanitizedValue.toString();
      if (sanitizedValueString.indexOf('e') > -1) {
        return sanitizedValue.toFixed(precision);
      }

      // Adding 2 to precision so that '0.' part of the number is ignored when slicing it
      return sanitizedValueString.slice(0, precision + 2);
    }

    return multiplier
      ? `${(sanitizedValue / multiplier.value).toFixed(precision).replace(regex, '$1')}${multiplier.symbol}`
      : '0';
  }

  static formatToFixedFractionDigitsOrMultiplier(value: number | string, precision = 0): string {
    const sanitizedValue = Number(value);
    const sanitizedValueString = sanitizedValue.toString();

    if (Math.abs(sanitizedValue) >= 1000) {
      return this.formatWithMultiplier(value, precision);
    }

    if (sanitizedValue > 0 && sanitizedValue < 1 && sanitizedValueString.indexOf('e') > -1) {
      return sanitizedValue.toFixed(precision);
    }

    const pointIndex = sanitizedValueString.indexOf('.');

    if (pointIndex === -1) {
      return `${sanitizedValueString}${precision === 0 ? '' : `.${'0'.repeat(precision)}`}`;
    }

    if (precision === 0) {
      return sanitizedValueString.slice(0, pointIndex);
    }

    const numberOfFractionDigits = sanitizedValueString.length - pointIndex - 1;
    return numberOfFractionDigits > precision
      ? sanitizedValueString.slice(0, pointIndex + precision + 1)
      : `${sanitizedValueString}${'0'.repeat(precision - numberOfFractionDigits)}`;
  }

  static formatToCurrency(value: string, numberOfDecimals = 2, symbol?: string): string {
    if (!value || isZeroString(value)) {
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

    let fractionPartFormatted = fractionalPart ? fractionalPart.slice(0, numberOfDecimals) : '';
    if (isZeroString(fractionPartFormatted)) {
      fractionPartFormatted = '';
    }

    return `${symbol || ''}${integerPartSeparatorsAdded}${fractionPartFormatted ? `.${fractionPartFormatted}` : ''}`;
  }

  static formatPercentage(value: number | string, precision = 2, roundValue?: boolean): string {
    const sanitizedValue = Number(value);

    if (sanitizedValue === undefined) {
      return '';
    }

    const sanitizedValuePer100 = sanitizedValue * 100;

    if (roundValue) {
      return `${sanitizedValuePer100.toFixed(precision)}%`;
    }

    const matchingString = `^-?\\d+(?:\\.\\d{0,${precision}})?`;
    const regEx = new RegExp(matchingString);

    const sanitizedValueString = sanitizedValuePer100.toString();
    const parsedString = sanitizedValueString.match(regEx);
    return parsedString ? `${parsedString[0]}%` : '';
  }
}
