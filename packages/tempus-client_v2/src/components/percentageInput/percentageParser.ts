export const checkIfNumberRegExp = /\d/;
export const removeLeadingZeroesRegExp = /^0+/;

export const formatValueToPercentage = (value: string): string => {
  if (!value) {
    return '';
  }

  // If provided value is negative, return 0
  if (value.startsWith('-')) {
    return '0';
  }

  let sanitizedValue = value.replace(removeLeadingZeroesRegExp, '');
  if (sanitizedValue.startsWith('.')) {
    sanitizedValue = `0${sanitizedValue}`;
  }

  const splitValue = sanitizedValue.split('.');

  // no decimals
  if (splitValue.length === 1) {
    const characters = splitValue[0].split('');

    // Remove non digit characters from string
    const filteredValues = characters.filter((v: string) => checkIfNumberRegExp.test(v));

    const integerPartNumber = Number(filteredValues.join(''));
    if (integerPartNumber > 100) {
      return '100';
    } else {
      return integerPartNumber.toString();
    }
  }

  // has decimals
  if (splitValue.length === 2) {
    const leftCharacters = splitValue[0].split('');
    const rightCharacters = splitValue[1].split('');

    const filteredLeftCharacters = leftCharacters.filter((v: string) => checkIfNumberRegExp.test(v));
    const filteredRightCharacters = rightCharacters.filter((v: string) => checkIfNumberRegExp.test(v));
    const truncatedRightCharacters = filteredRightCharacters.slice(0, 2);

    const leftValue = Number(filteredLeftCharacters.join(''));
    if (leftValue > 100) {
      return '100';
    }

    if (truncatedRightCharacters.length) {
      const parsedValue = `${filteredLeftCharacters.join('')}.${truncatedRightCharacters.join('')}`;
      return parsedValue;
    } else {
      const parsedValue = `${filteredLeftCharacters.join('')}.`;
      return parsedValue;
    }
  }

  if (splitValue.length > 2) {
    return '';
  }

  return value;
};
