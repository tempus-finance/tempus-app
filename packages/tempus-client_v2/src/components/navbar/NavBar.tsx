import { FC, useCallback, useContext } from 'react';
import { PoolDataContext } from '../../context/poolDataContext';
import TempusLogo from './tempusLogo';
import Links from './Links';
import Wallet from './Wallet';

import './NavBar.scss';

const NavBar: FC = () => {
  const { setPoolData } = useContext(PoolDataContext);

  const onLogoClick = useCallback(() => {
    setPoolData && setPoolData(previousContext => ({ selectedPool: '', poolData: previousContext.poolData }));
  }, [setPoolData]);

  return (
    <div className="tc__navBar">
      <div className="tc__navBar__left">
        <div className="tc__navBar__logo" onClick={onLogoClick}>
          <TempusLogo />
        </div>
      </div>

      <div className="tc__navBar__right">
        <Links />
        <Wallet />
      </div>
    </div>
  );
};

export default NavBar;
