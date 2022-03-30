import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import isMobile from 'is-mobile';
import reportWebVitals from './reportWebVitals';
import { Button, Checkbox, Icon, IconType, Link, ToggleSwitch, Typography, ActionButton } from './components/shared';

// Creates CSS variables for all color constants
import './components/shared/Color';

// Creates CSS variables for all shadow constants
import './components/shared/Shadow';

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
      <Checkbox checked={selected1} onChange={handleChange1} />
      <Checkbox checked={selected2} label="Label" onChange={handleChange2} />
    </>
  );
};

const ToggleSwitchDemo = () => {
  const [selected, setSelected] = useState(false);
  const handleChange = useCallback(() => {
    setSelected(!selected);
  }, [selected]);

  return <ToggleSwitch checked={selected} label="Label" onChange={handleChange} />;
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
    'up-arrow-thin',
    'right-arrow-thin',
    'left-arrow-thin',
    'down-arrow-thin',
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
          <Link href="https://app.tempus.finance/" title="go to app">
            <Icon type={type} />
          </Link>
        ))}
      </div>
      <div style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
        {iconTypes.map(type => (
          <Link href="abcd" title="stay">
            <Icon type={type} size="small" />
          </Link>
        ))}
      </div>
      <div style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
        {iconTypes.map(type => (
          <Button title="console.log()" onClick={() => console.log('this is an icon button')}>
            <Icon type={type} size="medium" />
          </Button>
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

const ActionButtonDemo = () => {
  return (
    <ActionButton color="secondary">
      <Typography variant="body-primary" weight="bold" color="text-inverted">
        Execute
      </Typography>
    </ActionButton>
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
      <BrowserRouter>
        <Typography variant="body-primary">Here the app</Typography>
        <CheckboxDemo />
        <ToggleSwitchDemo />
        <IconDemo />
        <ActionButtonDemo />
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root'),
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
