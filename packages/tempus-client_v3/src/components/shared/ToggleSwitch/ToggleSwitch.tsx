import { ChangeEvent, FC, useMemo } from 'react';
import { Typography } from '..';
import './toggle-switch.scss';

export interface ToggleSwitchProps {
  checked: boolean;
  label?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

let idCounter = 0;

const ToggleSwitch: FC<ToggleSwitchProps> = props => {
  const { checked, label, onChange } = props;
  const id = useMemo(() => `toggle-switch-${idCounter++}`, []);

  return (
    <span className="tc__toggle-switch">
      <span className="tc__toggle-switch__switch-container">
        <input id={id} checked={checked} type="checkbox" onChange={onChange} />
        <span className={`tc__toggle-switch__thumb ${checked ? 'tc__toggle-switch__thumb-active' : ''}`}></span>
        <span
          className={`tc__toggle-switch__background ${checked ? 'tc__toggle-switch__background-active' : ''}`}
        ></span>
      </span>
      {label && (
        <label htmlFor={id} className="tc__toggle-switch__label">
          <Typography variant="body-secondary" weight={checked ? 'bold' : 'regular'}>
            {label}
          </Typography>
        </label>
      )}
    </span>
  );
};

export default ToggleSwitch;
