import { useMemo } from 'react';
import { Typography } from '../shared';
import './checkbox.scss';

interface CheckboxProps {
  checked: boolean;
  label?: string;
}

let idCounter = 0;

const Checkbox = (props: CheckboxProps & React.HTMLProps<HTMLInputElement>) => {
  const { checked, label, ...checkboxProps } = props;
  const id = useMemo(() => checkboxProps.id ?? `checkbox-${idCounter++}`, [checkboxProps.id]);

  return (
    <span className="tc__checkbox">
      <span className="tc__checkbox__box-container">
        <input {...checkboxProps} id={id} checked={checked} type="checkbox" />
        <span className={`${checked ? 'tc__checkbox__checked-box' : ''}`} aria-hidden="true"></span>
      </span>
      {label && (
        <label htmlFor={id}>
          <Typography
            variant="body-secondary"
            className={`tc__checkbox__label ${checked ? 'tc__checkbox__label-selected' : ''}`}
          >
            {label}
          </Typography>
        </label>
      )}
    </span>
  );
};

export default Checkbox;
