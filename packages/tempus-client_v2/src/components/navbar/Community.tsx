import { useCallback, useContext, useState, useRef } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Popper } from '@material-ui/core';
import getText from '../../localisation/getText';
import { LanguageContext } from '../../context/languageContext';
import TwitterIcon from '../icons/TwitterIcon';
import DiscordIcon from '../icons/DiscordIcon';
import MediumIcon from '../icons/MediumIcon';
import GithubIcon from '../icons/GithubIcon';
import TelegramIcon from '../icons/TelegramIcon';
import './Community.scss';

// TODO
// style mouse over
// check icon with design

const Community = () => {
  const { language } = useContext(LanguageContext);

  const [communityMenuOpen, setCommunityMenuOpen] = useState<boolean>(false);

  const toggleCommunityMenu = useCallback(() => {
    setCommunityMenuOpen(prevValue => !prevValue);
  }, [setCommunityMenuOpen]);

  const communityMenuAnchor = useRef<HTMLLIElement>(null);

  const onTwitterClick = () => {
    window.open('https://twitter.com/tempusfinance', '_blank');
    toggleCommunityMenu();
  };

  const onDiscordClick = () => {
    window.open('https://discord.com/invite/6gauHECShr', '_blank');
    toggleCommunityMenu();
  };

  const onMediumClick = () => {
    window.open('https://medium.com/tempusfinance', '_blank');
    toggleCommunityMenu();
  };

  const onGitHubClick = () => {
    window.open('https://github.com/tempus-finance', '_blank');
    toggleCommunityMenu();
  };

  const onAnnouncementsClick = () => {
    window.open('https://t.me/tempusfinance', '_blank');
    toggleCommunityMenu();
  };
  const onChatClick = () => {
    window.open('https://t.me/tempuschat', '_blank');
    toggleCommunityMenu();
  };

  const onChineseChatClick = () => {
    window.open('https://t.me/joinchat/SaOp74Uqe2BiMGM1', '_blank');
    toggleCommunityMenu();
  };

  return (
    <>
      <li ref={communityMenuAnchor} onClick={toggleCommunityMenu}>
        {getText('community', language)}
      </li>
      <Popper
        className="tc__header__popper"
        open={communityMenuOpen}
        anchorEl={communityMenuAnchor.current}
        placement="bottom-end"
      >
        <div className="tc__header__community-menu__container">
          <List>
            <ListItem button onClick={onTwitterClick}>
              <ListItemIcon className="tc__header__community-menu__icon-container">
                <TwitterIcon />
              </ListItemIcon>
              <ListItemText primary="Twitter" />
            </ListItem>
            <ListItem button onClick={onDiscordClick}>
              <ListItemIcon className="tc__header__community-menu__icon-container">
                <DiscordIcon />
              </ListItemIcon>
              <ListItemText primary="Discord" />
            </ListItem>
            <ListItem button onClick={onMediumClick}>
              <ListItemIcon className="tc__header__community-menu__icon-container">
                <MediumIcon />
              </ListItemIcon>
              <ListItemText primary="Medium" />
            </ListItem>
            <ListItem button onClick={onGitHubClick}>
              <ListItemIcon className="tc__header__community-menu__icon-container">
                <GithubIcon />
              </ListItemIcon>
              <ListItemText primary="GitHub" />
            </ListItem>
            <ListItem button onClick={onAnnouncementsClick}>
              <ListItemIcon className="tc__header__community-menu__icon-container">
                <TelegramIcon />
              </ListItemIcon>
              <ListItemText primary={getText('tempusAnnouncements', language)} />
            </ListItem>
            <ListItem button onClick={onChatClick}>
              <ListItemIcon className="tc__header__community-menu__icon-container">
                <TelegramIcon />
              </ListItemIcon>
              <ListItemText primary={getText('tempusChat', language)} />
            </ListItem>
            <ListItem button onClick={onChineseChatClick}>
              <ListItemIcon className="tc__header__community-menu__icon-container">
                <TelegramIcon />
              </ListItemIcon>
              <ListItemText primary="Tempus 中文社區" />
            </ListItem>
          </List>
        </div>
      </Popper>
      {communityMenuOpen && <div className="tc__backdrop" onClick={toggleCommunityMenu} />}
    </>
  );
};

export default Community;
