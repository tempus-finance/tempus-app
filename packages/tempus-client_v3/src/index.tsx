import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import isMobile from 'is-mobile';
import reportWebVitals from './reportWebVitals';
import Checkbox from './components/Checkbox';
import { Typography } from './components/shared';

// Creates CSS variables for all color constants
import './components/shared/Color';

import './index.scss';

const mobile = isMobile();

try {
  const release = require('./release.json');
  console.log(`Current version: ${release.releaseVersion}`);
} catch (e) {}

const CheckboxDemo = () => {
  const [selected1, setSelected1] = useState(false);
  const [selected2, setSelected2] = useState(false);
  const handleChange1 = useCallback(() => {
    setSelected1(!selected1);
  }, [selected1]);
  const handleChange2 = useCallback(() => {
    setSelected2(!selected2);
  }, [selected2]);

  return (
    <>
      <Checkbox id="checkbox1" checked={selected1} onChange={handleChange1} />
      <Checkbox checked={selected2} label="Label" onChange={handleChange2} />
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
