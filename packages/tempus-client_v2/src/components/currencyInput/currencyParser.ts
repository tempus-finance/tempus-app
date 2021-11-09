import NumberUtils from '../../services/NumberUtils';

export const checkIfNumberRegExp = /\d/;
export const removeLeadingZeroesRegExp = /^0+/;

export const formatValueToCurrency = (value: string, precision?: number): string => {
  if (!value) {
    return '';
  }

  value = value.replace(removeLeadingZeroesRegExp, '');

  const splitValue = value.split('.');

  // no decimals
  if (splitValue.length === 1) {
    const characters = splitValue[0].split('');

    // Remove non digit characters from string
    const filteredValues = characters.filter((v: string) => checkIfNumberRegExp.test(v));
    return NumberUtils.formatToCurrency(filteredValues.join(''));
  }

  // has decimals
  if (splitValue.length === 2) {
    const leftCharacters = splitValue[0].split('');
    const rightCharacters = splitValue[1].split('');

    const filteredLeftCharacters = leftCharacters.filter((v: string) => checkIfNumberRegExp.test(v));
    const filteredRightCharacters = rightCharacters.filter((v: string) => checkIfNumberRegExp.test(v));
    const truncatedRightCharacters = precision ? filteredRightCharacters.slice(0, precision) : filteredRightCharacters;

    if (truncatedRightCharacters.length) {
      return `${NumberUtils.formatToCurrency(filteredLeftCharacters.join(''))}.${truncatedRightCharacters.join('')}`;
    } else {
      return `${NumberUtils.formatToCurrency(filteredLeftCharacters.join(''))}.`;
    }
  }

  if (splitValue.length > 2) {
    return '';
  }

  return value;
};

const parseStringToNumberRegEx = /\d|[.]/;
export const parseStringToNumber = (value: string): number => {
  const splitValue = value.split('');

  let result = splitValue.filter((v: string) => parseStringToNumberRegEx.test(v)).join('');

  return parseFloat(result);
};
