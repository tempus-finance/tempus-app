import { FC, useCallback, useMemo } from 'react';
import { Typography } from '..';
import './radio.scss';

export interface RadioProps {
  checked?: boolean;
  value?: any;
  label?: string;
  onChange?: (value: any) => void;
}

let idCounter = 0;

const Radio: FC<RadioProps> = props => {
  const { checked = false, value, label, onChange } = props;
  const id = useMemo(() => `radio-${idCounter++}`, []);
  const handleChange = useCallback(() => onChange?.(value), [value, onChange]);

  return (
    <span className="tc__radio">
      <span className="tc__radio__box-container">
        <input id={id} checked={checked} type="radio" onChange={handleChange} />
        <span className={`${checked ? 'tc__radio__checked-box' : ''}`} aria-hidden="true"></span>
      </span>
      {label && (
        <label htmlFor={id} className="tc__radio__label">
          <Typography variant="body-secondary" weight={checked ? 'bold' : 'regular'}>
            {label}
          </Typography>
        </label>
      )}
    </span>
  );
};

export default Radio;
