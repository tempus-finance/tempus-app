import { FC, MouseEvent, useState } from 'react';
import LanguageIcon from '@material-ui/icons/Language';
import { Button } from '@material-ui/core';
import { Menu } from '@material-ui/core';
import { MenuItem } from '@material-ui/core';
import { Language } from '../../localisation/getText';

type LanguagesOutProps = {
  onChangeLanguage: (language: Language) => void;
};

const Languages: FC<LanguagesOutProps> = ({ onChangeLanguage }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: MouseEvent<HTMLLIElement>) => {
    setAnchorEl(null);
    const language = (event.target as HTMLLIElement).getAttribute('data-value') as Language;
    setSelectedLanguage(language);
    onChangeLanguage(language);
  };

  return (
    <div>
      <Button
        id="language-button"
        aria-controls="language-button"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <LanguageIcon />
        {selectedLanguage.toUpperCase()}
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-menu',
        }}
      >
        <MenuItem onClick={handleClose} data-value="en">
          English
        </MenuItem>
        <MenuItem onClick={handleClose} data-value="it">
          Italiano
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Languages;
