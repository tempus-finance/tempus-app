import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import isMobile from 'is-mobile';
import reportWebVitals from './reportWebVitals';
import Checkbox from './components/Checkbox/Checkbox';
import Typography from './components/Typography/Typography';

// Creates CSS variables for all color constants
import './colors';

import './index.scss';

const mobile = isMobile();

try {
  const release = require('./release.json');
  console.log(`Current version: ${release.releaseVersion}`);
} catch (e) {}

const CheckboxDemo = () => {
  const [selected, setSelected] = useState(false);
  const handleChange = useCallback(() => {
    setSelected(!selected);
  }, [selected]);

  return (
    <>
      <Checkbox checked={selected} onChange={handleChange} />
      <Checkbox checked={selected} label="Label" onChange={handleChange} />
    </>
  );
};

if (mobile) {
  ReactDOM.render(
    <React.StrictMode>
      <div>Mobile not supported</div>
    </React.StrictMode>,
    document.getElementById('root'),
  );
} else {
  ReactDOM.render(
    <React.StrictMode>
      <Typography variant="body-primary">Here the app</Typography>
      <CheckboxDemo />
    </React.StrictMode>,
    document.getElementById('root'),
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
