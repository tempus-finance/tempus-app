import { ChangeEvent, FC, useMemo } from 'react';
import Typography from '../Typography';
import './checkbox.scss';

export interface CheckboxProps {
  checked: boolean;
  label?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

let idCounter = 0;

const Checkbox: FC<CheckboxProps> = props => {
  const { checked, label, onChange } = props;
  const id = useMemo(() => `checkbox-${idCounter++}`, []);

  return (
    <span className="tc__checkbox">
      <span className="tc__checkbox__box-container">
        <input id={id} checked={checked} type="checkbox" onChange={onChange} />
        <span className={`${checked ? 'tc__checkbox__checked-box' : ''}`} aria-hidden="true"></span>
      </span>
      {label && (
        <label htmlFor={id} className="tc__checkbox__label">
          <Typography variant="body-secondary" weight={checked ? 'bold' : 'regular'}>
            {label}
          </Typography>
        </label>
      )}
    </span>
  );
};

export default Checkbox;
