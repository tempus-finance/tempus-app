import { FC } from 'react';
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui';

const BodyCell: FC = (props: any) => {
  const className = `tf__dashboard__body__cell tf__dashboard__body__${props.column.name}`;
  return <VirtualTable.Cell {...props} className={className} />;
};

export default BodyCell;
