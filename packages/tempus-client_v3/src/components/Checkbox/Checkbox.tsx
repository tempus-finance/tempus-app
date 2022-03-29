import { Typography } from '../shared';
import './checkbox.scss';

interface CheckboxProps {
  id: string;
  checked: boolean;
  label?: string;
}

const Checkbox = (props: CheckboxProps & React.HTMLProps<HTMLInputElement>) => {
  const { id, checked, label, ...checkboxProps } = props;

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
