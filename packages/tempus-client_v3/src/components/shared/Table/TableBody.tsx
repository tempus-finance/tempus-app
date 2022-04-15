import { FC } from 'react';

const TableBody: FC = props => {
  const { children } = props;

  return <tbody>{children}</tbody>;
};
export default TableBody;
