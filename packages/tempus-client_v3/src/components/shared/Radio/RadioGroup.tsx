import { Children, cloneElement, isValidElement, ReactElement } from 'react';
import { RadioProps } from './Radio';

interface RadioGroupProps {
  value?: any;
  onChange?: (value: any) => void;
  children?: ReactElement<RadioProps> | ReactElement<RadioProps>[];
}

const RadioGroup = (props: RadioGroupProps) => {
  const { value, onChange, children } = props;

  return (
    <div className="tc__radio__radio-group">
      {Children.map(children, (child, index) => {
        return isValidElement(child)
          ? cloneElement(child, { checked: value === child.props.value, onChange: onChange, key: `radio-${index}` })
          : null;
      })}
    </div>
  );
};

export default RadioGroup;
