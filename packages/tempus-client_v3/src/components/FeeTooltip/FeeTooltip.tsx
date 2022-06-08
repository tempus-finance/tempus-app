import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DecimalUtils, Numberish } from 'tempus-core-services';
import { TooltipWrapper, Typography } from '../shared';
import './FeeTooltip.scss';

export interface FeeTooltipFees {
  deposit?: Numberish;
  redemption?: Numberish;
  earlyRedemption?: Numberish;
  swap?: Numberish;
}

export interface FeeTooltipProps {
  fees: FeeTooltipFees;
}

const FeeTooltip: FC<FeeTooltipProps> = props => {
  const { fees, children } = props;
  const { t } = useTranslation();

  const tooltipContent = useMemo(
    () => (
      <div className="tc__fee-tooltip__content">
        <Typography variant="body-primary" weight="bold">
          {t('FeeTooltip.title')}
        </Typography>
        <div className="tc__fee-tooltip__fees">
          <div className="tc__fee-tooltip__fee-row">
            <Typography variant="body-primary" color="text-disabled">
              {t('FeeTooltip.titleDeposit')}
            </Typography>
            <Typography type="mono" variant="body-primary" color="text-primary">
              {DecimalUtils.formatPercentage(fees.deposit ?? 0)}
            </Typography>
          </div>
          <div className="tc__fee-tooltip__fee-row">
            <Typography variant="body-primary" color="text-disabled">
              {t('FeeTooltip.titleRedemption')}
            </Typography>
            <Typography type="mono" variant="body-primary" color="text-primary">
              {DecimalUtils.formatPercentage(fees.redemption ?? 0)}
            </Typography>
          </div>
          <div className="tc__fee-tooltip__fee-row">
            <Typography variant="body-primary" color="text-disabled">
              {t('FeeTooltip.titleEarlyRedemption')}
            </Typography>
            <Typography type="mono" variant="body-primary" color="text-primary">
              {DecimalUtils.formatPercentage(fees.earlyRedemption ?? 0)}
            </Typography>
          </div>
          <div className="tc__fee-tooltip__fee-row">
            <Typography variant="body-primary" color="text-disabled">
              {t('FeeTooltip.titleSwap')}
            </Typography>
            <Typography type="mono" variant="body-primary" color="text-primary">
              {DecimalUtils.formatPercentage(fees.swap ?? 0)}
            </Typography>
          </div>
        </div>
        <hr />
        <span className="tc__fee-tooltip__info">
          <Typography variant="body-secondary" color="text-disabled">
            {t('FeeTooltip.infoText')}
          </Typography>
        </span>
      </div>
    ),
    [fees.deposit, fees.earlyRedemption, fees.redemption, fees.swap, t],
  );

  return <TooltipWrapper tooltipContent={tooltipContent}>{children}</TooltipWrapper>;
};

export default FeeTooltip;
