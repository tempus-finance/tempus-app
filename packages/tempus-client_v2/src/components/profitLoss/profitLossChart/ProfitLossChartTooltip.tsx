import { format } from 'date-fns';
import { useMemo } from 'react';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import Typography from '../../typography/Typography';

const ProfitLossChartTooltip = (props: TooltipProps<ValueType, NameType>) => {
  const { active, payload } = props;

  const valueFormatted = useMemo(() => {
    if (active && payload && payload[0]) {
      return payload[0].payload.value;
    }
  }, [active, payload]);

  const dateFormatted = useMemo(() => {
    if (active && payload && payload[0]) {
      return format(payload[0].payload.date, 'd MMM yyyy');
    }
  }, [active, payload]);

  const valueIncreaseFormatted = useMemo(() => {
    if (active && payload && payload[0]) {
      return payload[0].payload.valueIncrease;
    }
  }, [active, payload]);

  return (
    <div className="tc__profitLossChartTooltip">
      <Typography variant="body-text">{valueFormatted}</Typography>
      <Typography variant="body-text">{valueIncreaseFormatted}</Typography>
      <Typography variant="body-text">{dateFormatted}</Typography>
    </div>
  );
};
export default ProfitLossChartTooltip;
