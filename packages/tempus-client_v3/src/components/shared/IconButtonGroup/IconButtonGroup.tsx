import { FC, useState } from 'react';
import { IconVariant } from '../Icon/Icon';
import IconButton from '../IconButton/IconButton';
import './IconButtonGroup.scss';

export interface IconButtonGroupProps {
  types: IconVariant[];
  onChange: (selected: IconVariant) => void;
}

const IconButtonGroup: FC<IconButtonGroupProps> = props => {
  const { types, onChange } = props;

  const [selectedType, setSelectedType] = useState<IconVariant>(types[0]);

  const onClick = (value: IconVariant) => {
    setSelectedType(value);

    onChange(value);
  };

  return (
    <div className="tc__iconButtonGroup">
      {types.map(type => (
        <IconButton key={type} variant={type} onClick={onClick} selected={type === selectedType} />
      ))}
    </div>
  );
};
export default IconButtonGroup;
