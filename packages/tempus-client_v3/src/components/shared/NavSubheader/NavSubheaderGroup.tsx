import { FC } from 'react';
import './NavSubheader.scss';

const NavSubheaderGroup: FC = props => {
  const { children } = props;

  return <div className="tc__nav-subheader__group">{children}</div>;
};

export default NavSubheaderGroup;
