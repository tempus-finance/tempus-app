import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import isMobile from 'is-mobile';
import reportWebVitals from './reportWebVitals';
import Checkbox from './components/Checkbox';
import { Typography, Icon, IconType } from './components/shared';

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

const IconDemo = () => {
  const iconTypes: IconType[] = [
    'plus-round',
    'checkmark-round',
    'minus-round',
    'cross-round',
    'up-chevron',
    'right-chevron',
    'left-chevron',
    'down-chevron',
    'up-arrow',
    'right-arrow',
    'left-arrow',
    'down-arrow',
    'up-arrow2',
    'right-arrow2',
    'left-arrow2',
    'down-arrow2',
    'list-view',
    'grid-view',
    'plus',
    'minus',
    'menu',
    'close',
    'info',
    'info-bordered',
    'info-solid',
    'exclamation',
    'exclamation-bordered',
    'exclamation-neutral',
    'exclamation-error',
    'checkmark',
    'checkmark-bordered',
    'checkmark-solid',
    'external',
    'twitter',
    'discord',
    'medium',
    'github',
    'telegram',
    'scroll',
    'slippage',
    'globe',
    'dark',
  ];
  return (
    <>
      <div style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
        {iconTypes.map(type => (
          <Icon type={type} />
        ))}
      </div>
      <div style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
        {iconTypes.map(type => (
          <Icon type={type} size="small" />
        ))}
      </div>
      <div style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
        {iconTypes.map(type => (
          <Icon type={type} size="medium" />
        ))}
      </div>
      <div style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
        {iconTypes.map(type => (
          <Icon type={type} size="large" />
        ))}
      </div>
      <div style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
        {iconTypes.map(type => (
          <Icon type={type} size={48} />
        ))}
      </div>
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
      <IconDemo />
    </React.StrictMode>,
    document.getElementById('root'),
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
