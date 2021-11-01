import { FC, useContext } from 'react';
import { LanguageContext } from '../../context/language';
import TempusLogo from './tempusLogo';
import Links from './Links';
import Wallet from './Wallet';
import './NavBar.scss';

const NavBar: FC = () => {
  const { language, changeLanguage } = useContext(LanguageContext);

  return (
    <div className="tc__navBar">
      <div className="tc__navBar__left">
        <TempusLogo />
      </div>

      <div className="tc__navBar__right">
        <Links language={language} changeLanguage={changeLanguage} />
        <Wallet />
      </div>
    </div>
  );
};

export default NavBar;
