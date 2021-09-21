import { FC } from 'react';
import { Table } from '@devexpress/dx-react-grid';
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui';
import TokenIcon, { getTickerFromProtocol } from '../../tokenIcon';
import { ProtocolName } from '../../../interfaces';

import './protocolCell.scss';

const ProtocolCell: FC<Table.DataCellProps> = props => {
  const isParent: boolean = !props.row.parentId;
  const protocol: ProtocolName = props.row.protocol;

  return (
    <VirtualTable.Cell {...props}>
      {isParent && (
        <div className="tf__dashboard__body__protocol-icons_container">
          {props.row.protocols.map((protocol: ProtocolName) => {
            return <TokenIcon ticker={getTickerFromProtocol(protocol)} />;
          })}
        </div>
      )}
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
