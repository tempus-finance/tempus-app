import { FC } from 'react';
import './NavSubheader.scss';

interface NavSubheaderGroupProps {
  align: 'left' | 'right' | 'center';
}

const NavSubheader: FC<NavSubheaderGroupProps> = props => {
  const { align, children } = props;

  return (
    <div className="tc__nav-subheader">
      <div className="tc__nav-subheader__background" />
      <div style={{ justifyContent: align }} className="tc__nav-subheader__wrapper">
        {children}
      </div>
    </div>
  );
};

export default NavSubheader;
