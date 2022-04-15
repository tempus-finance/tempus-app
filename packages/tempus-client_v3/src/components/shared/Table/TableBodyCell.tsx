import { FC } from 'react';

import './TableBodyCell.scss';

interface TableBodyCellProps {
  align?: 'left' | 'center' | 'right';
}

const TableBodyCell: FC<TableBodyCellProps> = props => {
  const { align = 'left', children } = props;

  return (
    <td className="tc__tableBodyCell" data-align={align}>
      {children}
    </td>
  );
};
export default TableBodyCell;
