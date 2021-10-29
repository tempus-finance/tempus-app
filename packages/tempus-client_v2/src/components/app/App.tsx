import { useState } from 'react';
import { Context, defaultContextValue } from '../../context';
import NavBar from '../navbar/NavBar';
import Main from '../main/Main';
import { Language } from '../../localisation/getText';

import './App.scss';

const App = () => {
  const [language, setLanguage] = useState<Language>(defaultContextValue.language);

  return (
    <Context.Provider value={{ language, changeLanguage: setLanguage }}>
      <div className="tc__app__container">
        <NavBar />
        <Main />
      </div>
    </Context.Provider>
  );
};

export default App;
