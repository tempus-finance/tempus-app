import { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Community from './Community';
import Settings from './Settings';

import './Links.scss';

const Links = () => {
  const { language } = useContext(LanguageContext);

  const navigate = useNavigate();

  const onDashboardClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // TODO
  // link active state

  return (
    <div className="tc__navBar__links">
      <ul>
        <li onClick={onDashboardClick}>{getText('dashboard', language)}</li>
        <Community />
        <Settings />
      </ul>
    </div>
  );
};

export default Links;
