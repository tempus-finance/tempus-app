export const checkIfNumberRegExp = /\d/;
export const removeLeadingZeroesRegExp = /^0+/;

export const formatValueToPercentage = (
  value: string,
): {
  parsedValue: string;
  percentageValue: string;
} => {
  if (!value) {
    return {
      parsedValue: '',
      percentageValue: '',
    };
  }

  // If provided value is negative, return 0
  if (value.startsWith('-')) {
    return {
      parsedValue: '0',
      percentageValue: '0',
    };
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
      return {
        parsedValue: '100',
        percentageValue: '100',
      };
    } else {
      return {
        parsedValue: integerPartNumber.toString(),
        percentageValue: integerPartNumber.toString().replace(/[^0-9$.]/g, ''),
      };
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
      return {
        parsedValue: '100',
        percentageValue: '100',
      };
    }

    if (truncatedRightCharacters.length) {
      const parsedValue = `${filteredLeftCharacters.join('')}.${truncatedRightCharacters.join('')}`;
      return {
        parsedValue,
        percentageValue: parsedValue.replace(/[^0-9$.]/g, ''),
      };
    } else {
      const parsedValue = `${filteredLeftCharacters.join('')}.`;
      return {
        parsedValue,
        percentageValue: parsedValue.replace(/[^0-9$.]/g, ''),
      };
    }
  }

  if (splitValue.length > 2) {
    return {
      parsedValue: '',
      percentageValue: '',
    };
  }

  return {
    parsedValue: value,
    percentageValue: value.replace(/[^0-9$.]/g, ''),
  };
};
