import { isAfter } from 'date-fns';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Decimal, DecimalUtils, Ticker } from 'tempus-core-services';
import ButtonWrapper from '../ButtonWrapper';
import FormattedDate from '../FormattedDate';
import Icon from '../Icon';
import Typography from '../Typography';
import PoolPositionCardDataCell from './PoolPositionCardDataCell';

import './PoolPositionCard.scss';

export interface PoolPositionCardProps {
  apr: Decimal;
  term: Date;
  profitLoss: Decimal;
  balance: Decimal | null;
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

  const { t } = useTranslation();

  const [open, setOpen] = useState<boolean>(false);

  const onToggleClick = useCallback(() => {
    setOpen(prevState => !prevState);
  }, []);

  const aprFormatted = useMemo(() => {
    // Mature pools do not have Fixed APR
    if (isAfter(new Date(), term)) {
      return null;
    }

    return DecimalUtils.formatPercentage(apr);
  }, [apr, term]);

  return (
    <div className="tc__poolPositionCard">
      <div className="tc__poolPositionCard-row">
        {aprFormatted && (
          <div className="tc__poolPositionCard-cell">
            <div className="tc__poolPositionCard-cellData">
              <Typography variant="body-secondary" weight="bold" color="text-secondary">
                {t('PoolPositionCard.apr')}
              </Typography>
              <Typography variant="body-primary" weight="medium" type="mono">
                {aprFormatted}
              </Typography>
            </div>
          </div>
        )}
        <div className="tc__poolPositionCard-cell">
          <div className="tc__poolPositionCard-cellData">
            <Typography variant="body-secondary" weight="bold" color="text-secondary">
              {t('PoolPositionCard.term')}
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
                label={t('PoolPositionCard.profitLoss')}
                tokenDecimals={tokenDecimals}
                tokenExchangeRate={tokenExchangeRate}
                tokenTicker={tokenTicker}
                value={profitLoss}
              />
              <PoolPositionCardDataCell
                label={t('PoolPositionCard.balance')}
                tokenDecimals={tokenDecimals}
                tokenExchangeRate={tokenExchangeRate}
                tokenTicker={tokenTicker}
                value={balance}
              />
              <PoolPositionCardDataCell
                label={t('PoolPositionCard.totalYieldEarned')}
                tokenDecimals={tokenDecimals}
                tokenExchangeRate={tokenExchangeRate}
                tokenTicker={tokenTicker}
                value={totalYieldEarned}
              />
              <PoolPositionCardDataCell
                label={t('PoolPositionCard.projectedTotalYield')}
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
                {open ? t('PoolPositionCard.seeLess') : t('PoolPositionCard.seeMore')}
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
