import { FC } from 'react';
import './NavSubheader.scss';

const NavSubheader: FC = props => {
  const { children } = props;

  return (
    <div className="tc__nav-subheader">
      <div className="tc__nav-subheader__background" />
      <div className="tc__nav-subheader__wrapper">{children}</div>
    </div>
  );
};

export default NavSubheader;
