import { FC, memo } from 'react';
import { DecimalUtils, Numberish } from 'tempus-core-services';
import { Tooltip, Typography } from '../shared';
import './FeeTooltip.scss';

export interface FeeTooltipFees {
  deposit?: Numberish;
  redemption?: Numberish;
  earlyRedemption?: Numberish;
  swap?: Numberish;
}

interface FeeTooltipProps {
  open: boolean;
  fees: FeeTooltipFees;
}

const FeeTooltip: FC<FeeTooltipProps> = props => {
  const { open, fees } = props;

  return (
    <Tooltip open={open}>
      <div className="tc__fee-tooltip__content">
        <Typography variant="body-primary" weight="bold">
          Fee
        </Typography>
        <div className="tc__fee-tooltip__fees">
          <div className="tc__fee-tooltip__fee-row">
            <Typography variant="body-primary" color="text-disabled">
              Deposit
            </Typography>
            <Typography type="mono" variant="body-primary" color="text-primary">
              {DecimalUtils.formatPercentage(fees.deposit ?? 0)}
            </Typography>
          </div>
          <div className="tc__fee-tooltip__fee-row">
            <Typography variant="body-primary" color="text-disabled">
              Redemption
            </Typography>
            <Typography type="mono" variant="body-primary" color="text-primary">
              {DecimalUtils.formatPercentage(fees.redemption ?? 0)}
            </Typography>
          </div>
          <div className="tc__fee-tooltip__fee-row">
            <Typography variant="body-primary" color="text-disabled">
              Early Redemption
            </Typography>
            <Typography type="mono" variant="body-primary" color="text-primary">
              {DecimalUtils.formatPercentage(fees.earlyRedemption ?? 0)}
            </Typography>
          </div>
          <div className="tc__fee-tooltip__fee-row">
            <Typography variant="body-primary" color="text-disabled">
              Swap
            </Typography>
            <Typography type="mono" variant="body-primary" color="text-primary">
              {DecimalUtils.formatPercentage(fees.swap ?? 0)}
            </Typography>
          </div>
        </div>
        <hr />
        <span className="tc__fee-tooltip__info">
          <Typography variant="body-secondary" color="text-disabled">
            Swap fees will go to Liquidity providers
          </Typography>
        </span>
      </div>
    </Tooltip>
  );
};

export default memo(FeeTooltip);
