import { FC, useState } from 'react';
import { IconType } from '../Icon/Icon';
import IconButton from '../IconButton/IconButton';
import './IconButtonGroup.scss';

interface IconButtonGroupProps {
  types: IconType[];
  onChange: (selected: IconType) => void;
}

const IconButtonGroup: FC<IconButtonGroupProps> = props => {
  const { types, onChange } = props;

  const [selectedType, setSelectedType] = useState<IconType>(types[0]);

  const onClick = (value: IconType) => {
    setSelectedType(value);

    onChange(selectedType);
  };

  return (
    <div className="tc__iconButtonGroup">
      {types.map(type => {
        return <IconButton key={type} type={type} onClick={onClick} selected={type === selectedType} />;
      })}
    </div>
  );
};
export default IconButtonGroup;
