import { FC, useRef, useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Popper } from '@material-ui/core';
import WalletConnect from '../wallet-connect/wallet-connect';
import Spacer from '../spacer/spacer';
import MenuIcon from '../icons/MenuIcon';
import AboutIcon from '../icons/AboutIcon';
import DocsIcon from '../icons/DocsIcon';
import DiscordIcon from '../icons/DiscordIcon';
import AnalyticsIcon from '../icons/AnalyticsIcon';
import TempusLogo from './tempusLogo';

import './header.scss';

export type HeaderLinks = 'Dashboard' | 'Portfolio' | 'Analytics';

type HeaderOutProps = {
  onLogoClick: () => void;
  onAnalyticsClick: () => void;
};

type HeaderProps = HeaderOutProps;

const Header: FC<HeaderProps> = ({ onAnalyticsClick, onLogoClick }): JSX.Element => {
  const optionsMenuAnchor = useRef<HTMLDivElement>(null);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState<boolean>(false);

  const toggleOptionsMenu = () => {
    setOptionsMenuOpen(prevValue => !prevValue);
  };

  const onAboutClick = () => {
    window.open('https://tempus.finance', '_blank');
    toggleOptionsMenu();
  };

  const onDocsClick = () => {
    window.open('https://docs.tempus.finance', '_blank');
    toggleOptionsMenu();
  };

  const onDiscordClick = () => {
    window.open('https://discord.com/invite/6gauHECShr', '_blank');
    toggleOptionsMenu();
  };

  const onAnalyticsClickHandler = () => {
    onAnalyticsClick();
    toggleOptionsMenu();
  };

  return (
    <div className="tf__header__container">
      <div className="tf__logo">
        <TempusLogo fillColor="black" onClick={onLogoClick} />
      </div>
      <div className="tf__header__actions">
        <div className="tf__header__action-options" ref={optionsMenuAnchor} onClick={toggleOptionsMenu}>
          <div className="tf__header__action-icon-container">
            <MenuIcon />
          </div>
        </div>
        <Popper
          className="tf__header__popper"
          open={optionsMenuOpen}
          anchorEl={optionsMenuAnchor.current}
          placement="bottom-end"
        >
          <div className="tf__header__options-menu-container">
            <List dense>
              <ListItem button onClick={onAboutClick}>
                <ListItemIcon>
                  <AboutIcon />
                </ListItemIcon>
                <ListItemText primary="About" />
              </ListItem>
              <ListItem button onClick={onDocsClick}>
                <ListItemIcon>
                  <DocsIcon />
                </ListItemIcon>
                <ListItemText primary="Docs" />
              </ListItem>
              <ListItem button onClick={onDiscordClick}>
                <ListItemIcon>
                  <DiscordIcon />
                </ListItemIcon>
                <ListItemText primary="Discord" />
              </ListItem>
              <ListItem button onClick={onAnalyticsClickHandler}>
                <ListItemIcon>
                  <AnalyticsIcon />
                </ListItemIcon>
                <ListItemText primary="Analytics" />
              </ListItem>
            </List>
          </div>
        </Popper>
        {optionsMenuOpen && <div className="tf__backdrop" onClick={toggleOptionsMenu} />}
        <Spacer size={20} />
        <WalletConnect />
      </div>
    </div>
  );
};
export default Header;
