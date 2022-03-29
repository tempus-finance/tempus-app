import Typography from '../Typography/Typography';
import './checkbox.scss';

interface CheckboxProps {
  checked: boolean;
  label?: string;
}

const Checkbox = (props: CheckboxProps & React.HTMLProps<HTMLInputElement>) => {
  const { label, checked, ...checkboxProps } = props;

  return (
    <span className="tc__checkbox">
      <span className="tc__checkbox__box-container">
        <input {...checkboxProps} checked={checked} type="checkbox" />
        <span className={`${checked ? 'tc__checkbox__checked-box' : ''}`} aria-hidden="true"></span>
      </span>
      {label && (
        <Typography
          variant="body-secondary"
          className={`tc__checkbox__label ${checked ? 'tc__checkbox__label-selected' : ''}`}
        >
          {label}
        </Typography>
      )}
    </span>
  );
};

export default Checkbox;
