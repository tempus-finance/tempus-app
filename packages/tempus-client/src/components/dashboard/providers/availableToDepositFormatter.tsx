import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { ethers } from 'ethers';
import { DashboardRow, isChildRow, isParentRow } from '../../../interfaces';
import NumberUtils from '../../../services/NumberUtils';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';
import TokenIcon from '../../tokenIcon';
import './availableToDepositFormatter.scss';

const AvailableToDepositFormatter = (props: DataTypeProvider.ValueFormatterProps) => {
  const row = props.row as DashboardRow;

  if (isParentRow(row) && row.availableUSDToDeposit) {
    return (
      <div>{`$${NumberUtils.formatWithMultiplier(
        Number(ethers.utils.formatEther(row.availableUSDToDeposit)),
        2,
      )}`}</div>
    );
  }

  if (isChildRow(row)) {
    return (
      <div className="tf__dashboard__grid__avail-to-deposit-container">
        <div className="tf__dashboard__grid__avail-to-deposit-token-row">
          {row.availableTokensToDeposit ? (
            <>
              <p>
                {NumberUtils.formatWithMultiplier(
                  Number(ethers.utils.formatEther(row.availableTokensToDeposit.backingToken)),
                  2,
                )}
              </p>
              <div className="tf__dashboard__grid__avail-to-deposit-token-ticker-container">
                <Typography variant="body-text">{row.availableTokensToDeposit.backingTokenTicker}</Typography>
                <Spacer size={5} />
                <TokenIcon ticker={row.availableTokensToDeposit.backingTokenTicker} />
              </div>
            </>
          ) : (
            '-'
          )}
        </div>
        <div className="tf__dashboard__grid__avail-to-deposit-token-row">
          {row.availableTokensToDeposit ? (
            <>
              <p>
                {NumberUtils.formatWithMultiplier(
                  Number(ethers.utils.formatEther(row.availableTokensToDeposit.yieldBearingToken)),
                  2,
                )}
              </p>
              <div className="tf__dashboard__grid__avail-to-deposit-token-ticker-container">
                <Typography variant="body-text">{row.availableTokensToDeposit.yieldBearingTokenTicker}</Typography>
                <Spacer size={5} />
                <TokenIcon ticker={row.availableTokensToDeposit.yieldBearingTokenTicker} />
              </div>
            </>
          ) : (
            '-'
          )}
        </div>
      </div>
    );
  }
};

export default AvailableToDepositFormatter;
