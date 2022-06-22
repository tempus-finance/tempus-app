import { FC, memo } from 'react';
import { LoadingPlaceholder, Typography } from '../../shared';

export interface PortfolioInfoBoxProps {
  title: string;
  subtitle: string;
  value: string;
}

const PortfolioInfoBox: FC<PortfolioInfoBoxProps> = props => {
  const { title, subtitle, value } = props;

  return (
    <div className="tc__app__portfolio-box tc__app__portfolio-info-box">
      <Typography variant="title" weight="bold">
        {title}
      </Typography>
      <Typography variant="subtitle">{subtitle}</Typography>
      <div className="tc__app__portfolio-info-box-value">
        {value && (
          <>
            <Typography variant="subheader" type="mono" weight="medium">
              {value}
            </Typography>
            <Typography
              className="tc__app__portfolio-info-box-currency"
              variant="subheader"
              weight="medium"
              color="text-secondary"
            >
              USD
            </Typography>
          </>
        )}
        {!value && <LoadingPlaceholder width="medium" height="medium" />}
      </div>
    </div>
  );
};

export default memo(PortfolioInfoBox);
