import { useCallback, useContext, useState, useRef } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Popper } from '@material-ui/core';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import getText from '../../localisation/getText';
import { LocaleContext } from '../../context/localeContext';
import GovernanceIcon from '../icons/GovernanceIcon';
import DiscordIcon from '../icons/DiscordIcon';
import TwitterIcon from '../icons/TwitterIcon';
import GithubIcon from '../icons/GithubIcon';
import Button from '../common/Button';
import Typography from '../typography/Typography';

import './Community.scss';

// TODO
// style mouse over
// check icon with design

const Community = () => {
  const { locale } = useContext(LocaleContext);

  const [communityMenuOpen, setCommunityMenuOpen] = useState<boolean>(false);

  const toggleCommunityMenu = useCallback(() => {
    setCommunityMenuOpen(prevValue => !prevValue);
  }, [setCommunityMenuOpen]);

  const communityMenuAnchor = useRef<HTMLLIElement>(null);

  const onGovernanceClick = useCallback(() => {
    window.open('https://forum.tempus.finance/', '_blank');
    toggleCommunityMenu();
  }, [toggleCommunityMenu]);

  const onDiscordClick = useCallback(() => {
    window.open('https://discord.com/invite/6gauHECShr', '_blank');
    toggleCommunityMenu();
  }, [toggleCommunityMenu]);

  const onTwitterClick = useCallback(() => {
    window.open('https://twitter.com/tempusfinance', '_blank');
    toggleCommunityMenu();
  }, [toggleCommunityMenu]);

  const onGitHubClick = useCallback(() => {
    window.open('https://github.com/tempus-finance', '_blank');
    toggleCommunityMenu();
  }, [toggleCommunityMenu]);

  return (
    <li ref={communityMenuAnchor}>
      <Button onClick={toggleCommunityMenu}>
        <Typography variant="dropdown-text">{getText('community', locale)}</Typography>
        <KeyboardArrowDown />
      </Button>
      <Popper
        className="tc__header__popper"
        open={communityMenuOpen}
        anchorEl={communityMenuAnchor.current}
        placement="bottom-end"
      >
        <div className="tc__header__community-menu__container">
          <List disablePadding>
            <ListItem button onClick={onGovernanceClick}>
              <ListItemIcon className="tc__header__community-menu__icon-container">
                <GovernanceIcon />
              </ListItemIcon>
              <ListItemText primary={getText('governance', locale)} />
            </ListItem>
            <ListItem button onClick={onDiscordClick}>
              <ListItemIcon className="tc__header__community-menu__icon-container">
                <DiscordIcon />
              </ListItemIcon>
              <ListItemText primary="Discord" />
            </ListItem>
            <ListItem button onClick={onTwitterClick}>
              <ListItemIcon className="tc__header__community-menu__icon-container">
                <TwitterIcon />
              </ListItemIcon>
              <ListItemText primary="Twitter" />
            </ListItem>
            <ListItem button onClick={onGitHubClick}>
              <ListItemIcon className="tc__header__community-menu__icon-container">
                <GithubIcon />
              </ListItemIcon>
              <ListItemText primary="GitHub" />
            </ListItem>
          </List>
        </div>
      </Popper>
      {communityMenuOpen && <div className="tc__backdrop" onClick={toggleCommunityMenu} />}
    </li>
  );
};

export default Community;
