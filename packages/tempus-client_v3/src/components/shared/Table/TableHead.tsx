import { FC } from 'react';

const TableHead: FC = props => {
  const { children } = props;

  return <thead>{children}</thead>;
};
export default TableHead;
