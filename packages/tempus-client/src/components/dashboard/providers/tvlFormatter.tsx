import NumberUtils from '../../../services/NumberUtils';

const TVLFormatter = ({ value }: any) => {
  return NumberUtils.formatWithMultiplier(value, 2);
};

export default TVLFormatter;
