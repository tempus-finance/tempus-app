import { FC } from 'react';
import { Table } from '@devexpress/dx-react-grid-material-ui';

const FilterRow: FC = (props: any) => {
  return <Table.Row {...props} className="tf__dashboard__filter__row" />;
};

export default FilterRow;
