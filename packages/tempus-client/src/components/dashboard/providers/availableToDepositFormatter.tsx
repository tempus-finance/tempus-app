import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { ethers } from 'ethers';
import { DashboardRow, isChildRow, isParentRow } from '../../../interfaces';
import NumberUtils from '../../../services/NumberUtils';
import TokenIcon from '../../tokenIcon';
import './availableToDepositFormatter.scss';

const AvailableToDepositFormatter = (props: DataTypeProvider.ValueFormatterProps) => {
  const row = props.row as DashboardRow;

  if (isParentRow(row) && row.availableToDeposit) {
    return (
      <div>{`$${NumberUtils.formatWithMultiplier(Number(ethers.utils.formatEther(row.availableToDeposit)), 2)}`}</div>
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
                <TokenIcon ticker={row.availableTokensToDeposit.backingTokenTicker} />
                <p className="tf__dashboard__grid__avail-to-deposit-token-ticker">
                  {row.availableTokensToDeposit.backingTokenTicker}
                </p>
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
                <TokenIcon ticker={row.availableTokensToDeposit.yieldBearingTokenTicker} />
                <p className="tf__dashboard__grid__avail-to-deposit-token-ticker">
                  {row.availableTokensToDeposit.yieldBearingTokenTicker}
                </p>
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
