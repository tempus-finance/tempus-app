import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Chain, Decimal, DecimalUtils, prettifyProtocolName, ProtocolName, Ticker, ZERO } from 'tempus-core-services';
import { min } from 'date-fns';
import FormattedDate from '../FormattedDate';
import LoadingPlaceholder from '../LoadingPlaceholder';
import Logo from '../Logo';
import Typography from '../Typography';
import { PoolCardStatus, PoolCardVariant } from './PoolCardTypes';
import PoolCardRipples from './PoolCardRipples/PoolCardRipples';
import PoolCardFlag from './PoolCardFlag/PoolCardFlag';

import './PoolCard.scss';
import { useLocale } from '../../../hooks';

interface PoolCardProps {
  chain: Chain;
  ticker: Ticker;
  protocol: ProtocolName;
  poolCardVariant: PoolCardVariant;
  poolCardStatus: PoolCardStatus;
  terms: Date[];
  aprValues: (Decimal | undefined)[];
  color: string;
  multiplier?: number;
  totalBalance?: Decimal;
  poolAddresses: string[];
  cardsInGroup?: number;
  onClick: (
    chain: Chain,
    ticker: Ticker,
    protocol: ProtocolName,
    status: PoolCardStatus,
    poolAddresses: string[],
  ) => void;
}

const PoolCard: FC<PoolCardProps> = props => {
  const {
    chain,
    ticker,
    protocol,
    poolCardVariant,
    poolCardStatus,
    terms,
    aprValues,
    color,
    totalBalance,
    multiplier = 1,
    poolAddresses,
    cardsInGroup = 1,
    onClick,
  } = props;
  const { t } = useTranslation();
  const [locale] = useLocale();

  const earliestTerm = useMemo(() => min(terms), [terms]);

  const maxApr = useMemo(() => {
    let max: Decimal | undefined;
    aprValues.forEach(aprValue => {
      if (aprValue && aprValue.gte(max ?? ZERO)) {
        max = aprValue;
      }
    });
    return max;
  }, [aprValues]);

  const maxAprFormatted = useMemo(() => (maxApr ? DecimalUtils.formatPercentage(maxApr) : undefined), [maxApr]);

  const totalBalanceFormatted = useMemo(() => {
    if (!totalBalance) {
      return null;
    }
    return DecimalUtils.formatWithMultiplier(totalBalance, 2);
  }, [totalBalance]);

  const aprLabel = useMemo(() => {
    if (poolCardVariant === 'markets') {
      return aprValues.length === 1 ? t('PoolCard.fixedApr') : t('PoolCard.fixedAprUpTo');
    }

    return aprValues.length === 1 ? t('PoolCard.apr') : t('PoolCard.aprUpTo');
  }, [aprValues.length, poolCardVariant, t]);

  const handleClick = useCallback(() => {
    onClick(chain, ticker, protocol, poolCardStatus, poolAddresses);
  }, [chain, ticker, protocol, poolCardStatus, poolAddresses, onClick]);

  const loading = !maxApr;

  return (
    <div className="tc__poolCard-container" data-card-stack={cardsInGroup > 1 ? Math.min(cardsInGroup, 3) : undefined}>
      <div className="tc__poolCard" data-card-variant={poolCardVariant} onClick={handleClick}>
        {/* Pool backing token ticker */}
        {loading && (
          <div className="tc__poolCard-value-placeholder-container">
            <LoadingPlaceholder width="small" height="medium" />
          </div>
        )}
        {!loading && (
          <Typography variant="subheader" weight="bold">
            {multiplier > 1 && `x${multiplier}`} {ticker}
          </Typography>
        )}

        {/* Pool underlying protocol name */}
        {loading && (
          <div className="tc__poolCard-protocol-placeholder-container">
            <LoadingPlaceholder width="tiny" height="small" />
          </div>
        )}
        {!loading && (
          <div className="tc__poolCard-protocol">
            <Logo type={`protocol-${protocol}`} size={20} />
            <Typography variant="body-secondary" weight="medium">
              {prettifyProtocolName(protocol)}
            </Typography>
          </div>
        )}

        <div className="tc__poolCard-info">
          {/* APR - Shown only for non mature pools */}
          <div className="tc__poolCard-info-row">
            <Typography variant="body-secondary" weight="medium" color="text-secondary">
              {aprLabel}
            </Typography>
            {loading && (
              <div className="tc__poolCard-value-placeholder-container">
                <LoadingPlaceholder width="medium" height="medium" />
              </div>
            )}
            {!loading && (
              <Typography variant="subheader" weight="medium" type="mono">
                {poolCardStatus === 'Matured' ? t('PoolCard.notApplicable') : maxAprFormatted}
              </Typography>
            )}
          </div>

          {/* Term */}
          <div className="tc__poolCard-info-row">
            <Typography variant="body-secondary" weight="medium" color="text-secondary">
              {terms.length > 1 ? t('PoolCard.earliestTerm') : t('PoolCard.term')}
            </Typography>
            {loading && (
              <div className="tc__poolCard-value-placeholder-container">
                <LoadingPlaceholder width="large" height="medium" />
              </div>
            )}
            {!loading && <FormattedDate date={earliestTerm} locale={locale} size="large" />}
          </div>

          {/* Total Balance */}
          {poolCardVariant === 'portfolio' && totalBalanceFormatted && (
            <div className="tc__poolCard-info-row">
              <Typography variant="body-secondary" weight="medium" color="text-secondary">
                {cardsInGroup && cardsInGroup > 1 ? t('PoolCard.totalBalance') : t('PoolCard.balance')}
              </Typography>
              {loading && (
                <div className="tc__poolCard-value-placeholder-container">
                  <LoadingPlaceholder width="medium" height="medium" />
                </div>
              )}
              {!loading && (
                <Typography variant="subheader" weight="medium" type="mono">
                  {totalBalanceFormatted}
                </Typography>
              )}
            </div>
          )}
        </div>

        {!loading && (
          <>
            <PoolCardRipples color={color} />
            <PoolCardFlag ticker={ticker} status={poolCardStatus} />
          </>
        )}
      </div>

      {cardsInGroup >= 2 && <div className="tc__poolCard-stack-card tc__poolCard-stack-card-2" />}
      {cardsInGroup >= 3 && <div className="tc__poolCard-stack-card tc__poolCard-stack-card-3" />}
    </div>
  );
};
export default PoolCard;
