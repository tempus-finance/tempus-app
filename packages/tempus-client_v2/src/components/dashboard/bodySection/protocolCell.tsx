import { FC } from 'react';
import { Table } from '@devexpress/dx-react-grid';
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui';
import TokenIcon, { getTickerFromProtocol } from '../../tokenIcon';
import { ProtocolName } from '../../../interfaces/ProtocolName';

import './protocolCell.scss';

const ProtocolCell: FC<Table.DataCellProps> = props => {
  const isParent: boolean = !props.row.parentId;
  const row = props.row;

  return (
    <VirtualTable.Cell {...props}>
      {isParent && (
        <div className="tf__dashboard__body__protocol-icons_container">
          {row.protocols.map((protocol: ProtocolName, index: number) => {
            return <TokenIcon key={index} ticker={getTickerFromProtocol(protocol)} />;
          })}
        </div>
      )}
      {!isParent && (
        <div className="tf__dashboard__body__protocol_container">
          <TokenIcon ticker={getTickerFromProtocol(row.tempusPool.protocol)} />
          <span className="tf__dashboard__body__protocol_label">{row.tempusPool.protocol}</span>
        </div>
      )}
    </VirtualTable.Cell>
  );
};

export default ProtocolCell;
