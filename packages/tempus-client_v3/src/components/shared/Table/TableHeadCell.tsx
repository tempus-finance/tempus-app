import { FC } from 'react';
import Typography from '../Typography';

import './TableHeadCell.scss';

interface TableHeadCellProps {
  label: string;
  align?: 'left' | 'center' | 'right';
}

const TableHeadCell: FC<TableHeadCellProps> = props => {
  const { label, align = 'left' } = props;

  return (
    <th className="tc__tableHeadCell" data-align={align}>
      <Typography variant="body-primary" weight="bold">
        {label}
      </Typography>
    </th>
  );
};
export default TableHeadCell;
