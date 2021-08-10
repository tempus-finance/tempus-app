import { FC } from 'react';
import { Table } from '@devexpress/dx-react-grid-material-ui';

const HeaderRow: FC = (props: any) => {
  return <Table.Row {...props} className="tf__dashboard__header__row" />;
};

export default HeaderRow;
