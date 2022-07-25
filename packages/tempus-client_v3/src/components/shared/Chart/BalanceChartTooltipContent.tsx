import { FC } from 'react';
import { Ticker } from 'tempus-core-services';
import FormattedDate from '../FormattedDate';
import Typography from '../Typography';
import './Chart.scss';

export interface BalanceChartTooltipContentProps {
  title?: string;
  value: string;
  currency: Ticker | 'USD';
  date: Date;
  locale: string;
}

const BalanceChartTooltipContent: FC<BalanceChartTooltipContentProps> = props => {
  const { title, value, currency, date, locale } = props;

  return (
    <div className="tc__chart__balance-tooltip-content">
      {title && (
        <Typography
          className="tc__chart__balance-tooltip-content-title"
          variant="body-primary"
          weight="bold"
          color="text-secondary"
        >
          {title}
        </Typography>
      )}
      <div className="tc__chart__balance-tooltip-content-value">
        <Typography variant="subtitle" type="mono" weight="bold">
          {value} {currency}
        </Typography>
      </div>
      <FormattedDate date={date} locale={locale} size="small" textColor="text-secondary" separatorContrast="low" />
    </div>
  );
};

export default BalanceChartTooltipContent;
