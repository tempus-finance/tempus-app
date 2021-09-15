// External Libraries
import { FC } from 'react';

// External UI Components
import { Table } from '@devexpress/dx-react-grid';
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui';

// Interfaces
import { ProtocolName, Ticker } from '../../../interfaces';

// Style
import './protocolCell.scss';
import TokenIcon from '../../tokenIcon';

const ProtocolCell: FC<Table.DataCellProps> = props => {
  const isParent: boolean = !props.row.parentId;
  const protocol: ProtocolName = props.row.protocol;

  return (
    <VirtualTable.Cell {...props}>
      {isParent &&
        props.row.protocols.map((protocol: ProtocolName) => {
          return (
            <div className="tf__dashboard__body__protocol-icon-align">
              <TokenIcon ticker={getTickerFromProtocol(protocol)} />
            </div>
          );
        })}
      {!isParent && (
        <div className="tf__dashboard__body__protocol_container">
          <TokenIcon ticker={getTickerFromProtocol(protocol)} />
          <span className="tf__dashboard__body__protocol_label">{protocol}</span>
        </div>
      )}
    </VirtualTable.Cell>
  );
};

export default ProtocolCell;

const getTickerFromProtocol = (protocol: ProtocolName): Ticker => {
  if (protocol === 'compound') {
    return 'COMP';
  }

  return protocol.toUpperCase() as Ticker;
};
