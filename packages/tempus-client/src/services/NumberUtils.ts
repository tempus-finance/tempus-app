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

  static formatPercentage(value: any, precision: number = 0): string {
    const sanitizedValue = Number(value);
    return sanitizedValue ? `${(sanitizedValue * 100).toFixed(precision)}%` : ``;
  }
}

export default NumberUtils;
