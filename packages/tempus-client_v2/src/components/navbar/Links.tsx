import { FC } from 'react';
import getText, { Language } from '../../localisation/getText';
import SharedProps from '../../sharedProps';
import Languages from './Languages';
import './Links.scss';

type LinksInProps = SharedProps & { changeLanguage: any };

const Links: FC<LinksInProps> = ({ language, changeLanguage }) => {
  const onChangeLanguage = (language: Language) => {
    changeLanguage(language);
  };

  return (
    <div className="tc__navBar__links">
      <ul>
        <li>{getText('dashboard', language)}</li>
        <li>{getText('analytics', language)}</li>
        <li>{getText('community', language)}</li>
        <li>{getText('settings', language)}</li>
        <li>
          <Languages onChangeLanguage={onChangeLanguage} />
        </li>
      </ul>
    </div>
  );
};

export default Links;
