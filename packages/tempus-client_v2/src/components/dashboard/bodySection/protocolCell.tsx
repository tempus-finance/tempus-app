import { FC } from 'react';
import { Table } from '@devexpress/dx-react-grid';
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui';
import { ProtocolName } from 'tempus-core-services';
import Typography from '../../typography/Typography';
import TokenIcon, { getTickerFromProtocol } from '../../tokenIcon';

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
          <Typography color="default" variant="body-text">
            <span className="tf__dashboard__body__protocol_label">{row.tempusPool.protocol}</span>
          </Typography>
        </div>
      )}
    </VirtualTable.Cell>
  );
};

export default ProtocolCell;
