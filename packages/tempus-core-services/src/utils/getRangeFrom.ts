export function getRangeFrom<ValueType>(values: ValueType[]): ValueType[] {
  let minValue = values[0];
  let maxValue = values[0];
  values.forEach(value => {
    if (!value) {
      return;
    }
    if (minValue && minValue > value) {
      minValue = value;
    }
    if (maxValue && maxValue < value) {
      maxValue = value;
    }
  });

  return [minValue, maxValue];
}
