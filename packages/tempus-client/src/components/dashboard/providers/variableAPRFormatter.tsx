import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';

const TVLFormatter = ({ row }: any) => {
  debugger;
  return (
    <Typography color="default" variant="body-text">
      ${NumberUtils.formatWithMultiplier(value, 2)}
    </Typography>
  );
};
export default TVLFormatter;
