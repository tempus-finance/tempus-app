// External Libraries
import { FC } from 'react';

// External UI Components
import { Table } from '@devexpress/dx-react-grid';
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui';

// Interfaces
import { Ticker } from '../../../interfaces';

// Style
import './protocolCell.scss';

const ProtocolCell: FC<Table.DataCellProps> = props => {
  const ticker = props.value;
  return (
    <VirtualTable.Cell {...props}>
      {ticker && <span className="tf__dashboard__body__protocol_label">{getProtocolFromTicker(ticker)}</span>}
    </VirtualTable.Cell>
  );
};

export default ProtocolCell;

// TODO implement a map between Ticker and Protocol
const getProtocolFromTicker = (ticker: Ticker) => {
  if (ticker === 'COMP') {
    return 'compound';
  }

  return ticker.toLocaleLowerCase();
};
