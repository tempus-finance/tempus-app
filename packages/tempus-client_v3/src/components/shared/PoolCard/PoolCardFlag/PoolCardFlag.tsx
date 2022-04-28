import { FC } from 'react';
import { Ticker } from 'tempus-core-services';
import Logo, { LogoType } from '../../Logo';
import Typography, { TypographyColor } from '../../Typography';
import { PoolCardStatus } from '../PoolCardTypes';

import './PoolCardFlag.scss';

interface PoolCardFlagProps {
  ticker: Ticker;
  status: PoolCardStatus;
}

const PoolCardFlag: FC<PoolCardFlagProps> = props => {
  const { ticker, status } = props;

  let labelColor: TypographyColor = 'text-primary';
  if (status === 'Fixed' || status === 'Boosted' || status === 'Matured') {
    labelColor = 'text-primary-inverted';
  }

  return (
    <div className="tc__poolCardFlag" data-status={status}>
      <div className="tc__poolCardFlag-label" data-status={status}>
        <Typography variant="body-secondary" weight="bold" color={labelColor}>
          {status}
        </Typography>
      </div>
      <div className="tc__poolCardFlag-ripples">
        <div className="tc__poolCardFlag-ripples-1" />
        <div className="tc__poolCardFlag-ripples-2" />
        <div className="tc__poolCardFlag-ripples-3" />
        <div className="tc__poolCardFlag-icon">
          {/* TODO - We need to create logo for each Ticker (interface) and remove unused Tickers (from interface) */}
          {/* When above TODO is completed we can remove type cast here */}
          <Logo type={`token-${ticker}` as LogoType} size={64} />
        </div>
      </div>

      <div className="tc__poolCardFlag-arrows" data-status={status}>
        <div className="tc__poolCardFlag-arrows-mask" />
        <div className="tc__poolCardFlag-arrows-1" />
        <div className="tc__poolCardFlag-arrows-2" />
        <div className="tc__poolCardFlag-arrows-3" />
      </div>
    </div>
  );
};
export default PoolCardFlag;
