import { FC } from 'react';
import { TableHeaderRow } from '@devexpress/dx-react-grid-material-ui';

const HeaderCell: FC<TableHeaderRow.CellProps> = (props: TableHeaderRow.CellProps) => {
  const className = `tf__dashboard__header__cell tf__dashboard__header__${props.column.name}`;
  return <TableHeaderRow.Cell {...props} className={className} />;
};

export default HeaderCell;
