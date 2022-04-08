import { Children, cloneElement, FC, isValidElement, ReactElement } from 'react';
import { RadioProps } from './Radio';

interface RadioGroupProps {
  value?: any;
  onChange?: (value: any) => void;
  children?: ReactElement<RadioProps> | ReactElement<RadioProps>[];
}

const RadioGroup: FC<RadioGroupProps> = props => {
  const { value, onChange, children } = props;

  return (
    <div className="tc__radio__radio-group">
      {Children.map(children, (child, index) =>
        isValidElement(child)
          ? cloneElement(child, { checked: value === child.props.value, onChange, key: `radio-${index}` })
          : null)}
    </div>
  );
};

export default RadioGroup;
