import { FC, useCallback, useMemo, useState } from 'react';
import { Decimal, DecimalUtils, Ticker } from 'tempus-core-services';
import ButtonWrapper from '../ButtonWrapper';
import FormattedDate from '../FormattedDate';
import Icon from '../Icon';
import Typography from '../Typography';
import PoolPositionCardDataCell from './PoolPositionCardDataCell';

import './PoolPositionCard.scss';

export interface PoolPositionCardProps {
  apr: number;
  term: Date;
  profitLoss: Decimal;
  balance: Decimal;
  totalYieldEarned: Decimal;
  projectedTotalYield: Decimal;
  // Used to convert and show above values in fiat currency
  tokenExchangeRate: Decimal;
  tokenDecimals: number;
  tokenTicker: Ticker;
}

const PoolPositionCard: FC<PoolPositionCardProps> = props => {
  const {
    apr,
    term,
    profitLoss,
    balance,
    totalYieldEarned,
    projectedTotalYield,
    tokenExchangeRate,
    tokenDecimals,
    tokenTicker,
  } = props;

  const [open, setOpen] = useState<boolean>(false);

  const onToggleClick = useCallback(() => {
    setOpen(prevState => !prevState);
  }, []);

  const aprFormatted = useMemo(() => DecimalUtils.formatPercentage(apr), [apr]);

  return (
    <div className="tc__poolPositionCard">
      <div className="tc__poolPositionCard-row">
        <div className="tc__poolPositionCard-cell">
          <div className="tc__poolPositionCard-cellData">
            <Typography variant="body-secondary" weight="bold" color="text-secondary">
              APR
            </Typography>
            <Typography variant="body-primary" weight="medium" type="mono">
              {aprFormatted}
            </Typography>
          </div>
        </div>
        <div className="tc__poolPositionCard-cell">
          <div className="tc__poolPositionCard-cellData">
            <Typography variant="body-secondary" weight="bold" color="text-secondary">
              Term
            </Typography>
            <FormattedDate date={term} size="medium" separatorContrast="high" />
          </div>
        </div>
      </div>
      {open && (
        <>
          <div className="tc__poolPositionCard-divider" />
          <div className="tc__poolPositionCard-row">
            <div className="tc__poolPositionCard-cell">
              <PoolPositionCardDataCell
                label="Profit/loss"
                tokenDecimals={tokenDecimals}
                tokenExchangeRate={tokenExchangeRate}
                tokenTicker={tokenTicker}
                value={profitLoss}
              />
              <PoolPositionCardDataCell
                label="Balance"
                tokenDecimals={tokenDecimals}
                tokenExchangeRate={tokenExchangeRate}
                tokenTicker={tokenTicker}
                value={balance}
              />
              <PoolPositionCardDataCell
                label="Total Yield Earned"
                tokenDecimals={tokenDecimals}
                tokenExchangeRate={tokenExchangeRate}
                tokenTicker={tokenTicker}
                value={totalYieldEarned}
              />
              <PoolPositionCardDataCell
                label="Projected Total Yield"
                tokenDecimals={tokenDecimals}
                tokenExchangeRate={tokenExchangeRate}
                tokenTicker={tokenTicker}
                value={projectedTotalYield}
              />
            </div>
          </div>
          <div className="tc__poolPositionCard-divider" />
        </>
      )}

      <div className="tc__poolPositionCard-row">
        <div className="tc__poolPositionCard-cell" data-size="small">
          <ButtonWrapper onClick={onToggleClick}>
            <div className="tc__poolPositionCard-seeMore">
              <Typography variant="body-primary" weight="bold">
                {open ? 'See less' : 'See more'}
              </Typography>
              &nbsp; {/* space character */}
              <Icon variant={open ? 'up-chevron' : 'down-chevron'} size="small" />
            </div>
          </ButtonWrapper>
        </div>
      </div>
    </div>
  );
};
export default PoolPositionCard;
