export const checkIfNumberRegExp = /\d/;
export const removeLeadingZeroesRegExp = /^0+/;

export const formatValueToPercentage = (value: string): string => {
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

    const value = Number(filteredValues.join(''));
    if (value > 100) {
      return '100';
    } else {
      return value.toString();
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
      return `${filteredLeftCharacters.join('')}.${truncatedRightCharacters.join('')}`;
    } else {
      return `${filteredLeftCharacters.join('')}.`;
    }
  }

  if (splitValue.length > 2) {
    return '';
  }

  return value;
};
