import { FC } from 'react';
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui';
import TokenIcon from '../../tokenIcon';
import { Ticker } from '../../../interfaces';

const ProtocolCell: FC = (props: any) => {
  const className = `tf__dashboard__body__cell tf__dashboard__body__protocol`;
  const ticker = props.value;
  return (
    <VirtualTable.Cell {...props} className={className}>
      {ticker && (
        <div>
          <TokenIcon ticker={ticker} />
          <span>{getProtocolFromTicker(ticker)}</span>
        </div>
      )}
    </VirtualTable.Cell>
  );
};

export default ProtocolCell;

// TODO implement a map between Ticker and Protocol
const getProtocolFromTicker = (ticker: Ticker) => {
  if (ticker === 'comp') {
    return 'compound';
  }

  return ticker;
};
