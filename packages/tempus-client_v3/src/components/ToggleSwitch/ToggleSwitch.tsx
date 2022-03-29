import { useMemo } from 'react';
import { Typography } from '../shared';
import './toggle-switch.scss';

interface ToggleSwitchProps {
  checked: boolean;
  label?: string;
}

let idCounter = 0;

const ToggleSwitch = (props: ToggleSwitchProps & React.HTMLProps<HTMLInputElement>) => {
  const { checked, label, ...checkboxProps } = props;
  const id = useMemo(() => checkboxProps.id ?? `toggle-switch-${idCounter++}`, [checkboxProps.id]);

  return (
    <span className="tc__toggle-switch">
      <span className="tc__toggle-switch__switch-container">
        <input {...checkboxProps} id={id} checked={checked} type="checkbox" />
        <span className={`tc__toggle-switch__thumb ${checked ? 'tc__toggle-switch__thumb-active' : ''}`}></span>
        <span
          className={`tc__toggle-switch__background ${checked ? 'tc__toggle-switch__background-active' : ''}`}
        ></span>
      </span>
      {label && (
        <label htmlFor={id}>
          <Typography
            variant="body-secondary"
            weight={checked ? 'bold' : 'regular'}
            className="tc__toggle-switch__label"
          >
            {label}
          </Typography>
        </label>
      )}
    </span>
  );
};

export default ToggleSwitch;
