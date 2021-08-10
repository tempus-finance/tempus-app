import { FC } from 'react';
import { Table } from '@devexpress/dx-react-grid-material-ui';

const BodyRow: FC = (props: any) => {
  const isChild = !!props.row.parentId;
  const className = `tf__dashboard__body__row ${isChild ? 'tf__dashboard__body__row-child' : ''}`;

  return <Table.Row {...props} className={className} />;
};

export default BodyRow;
