const formatValueToCurrencyRegExp = /\d/;
export const formatValueToCurrency = (value: any): string | undefined => {
  if (!value) {
    return '';
  }

  const splitValue = value.toString().split('.');

  // no decimals
  if (splitValue.length === 1) {
    const values = splitValue[0].split('');

    const filteredValues = values.filter((v: string) => formatValueToCurrencyRegExp.test(v));
    return new Intl.NumberFormat().format(parseInt(filteredValues.join(''), 10));
  }

  // decimals
  if (splitValue.length === 2) {
    const leftValues = splitValue[0].split('');
    const rightValues = splitValue[1].split('');

    const filteredLeftValues = leftValues.filter((v: string) => formatValueToCurrencyRegExp.test(v));
    const filteredRightValues = rightValues.filter((v: string) => formatValueToCurrencyRegExp.test(v));

    if (filteredRightValues.length) {
      return `${new Intl.NumberFormat().format(parseInt(filteredLeftValues.join(''), 10))}.${filteredRightValues.join(
        '',
      )}`;
    } else {
      return `${new Intl.NumberFormat().format(parseInt(filteredLeftValues.join(''), 10))}.`;
    }
  }

  if (splitValue.length > 2) {
    return undefined;
  }

  return value;
};

const parseStringToNumberRegEx = /\d|[.]/;
export const parseStringToNumber = (value: string): number => {
  const splitValue = value.split('');

  let result = splitValue.filter((v: string) => parseStringToNumberRegEx.test(v)).join('');

  return parseFloat(result);
};
