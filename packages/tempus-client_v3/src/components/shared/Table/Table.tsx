import { FC } from 'react';

import './Table.scss';

const Table: FC = props => {
  const { children } = props;

  return <table className="tc__table">{children}</table>;
};
export default Table;
