import { FC, useCallback } from 'react';
import { useState as useHookState } from '@hookstate/core';
import { selectedPoolState } from '../../state/PoolDataState';
import TempusLogo from './tempusLogo';
import Links from './Links';
import Wallet from '../wallet/Wallet';

import './NavBar.scss';

const NavBar: FC = () => {
  const selectedPool = useHookState(selectedPoolState);

  const onLogoClick = useCallback(() => {
    selectedPool.set('');
  }, [selectedPool]);

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
