const multiplierLookup = [
  { value: 1e18, symbol: 'E' },
  { value: 1e15, symbol: 'P' },
  { value: 1e12, symbol: 'T' },
  { value: 1e9, symbol: 'G' },
  { value: 1e6, symbol: 'M' },
  { value: 1e3, symbol: 'k' },
  { value: 1, symbol: '' },
];

const regex = /\.0+$|(\.[0-9]*[1-9])0+$/;

class NumberUtils {
  static format(value: number, precision: number = 0): string {
    const multiplier = multiplierLookup.find(item => Math.abs(value) >= item.value);

    return multiplier
      ? `${(value / multiplier.value).toFixed(precision).replace(regex, '$1')}${multiplier.symbol}`
      : '0';
  }
}

export default NumberUtils;
