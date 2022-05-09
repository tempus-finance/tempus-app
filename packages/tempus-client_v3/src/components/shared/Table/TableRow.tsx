import { FC, useCallback } from 'react';

import './TableRow.scss';

interface TableRowProps {
  id: string;
  onClick?: (id: string) => void;
}

const TableRow: FC<TableRowProps> = props => {
  const { id, onClick, children } = props;

  const onRowClick = useCallback(() => {
    onClick?.(id);
  }, [id, onClick]);

  return (
    <tr id={id} className="tc__tableRow" onClick={onRowClick}>
      {children}
    </tr>
  );
};
export default TableRow;
