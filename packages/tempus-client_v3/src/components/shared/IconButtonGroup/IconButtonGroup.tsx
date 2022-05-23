import { FC, useCallback } from 'react';
import { IconVariant } from '../Icon/Icon';
import IconButton from '../IconButton/IconButton';
import './IconButtonGroup.scss';

export interface IconButtonGroupProps {
  variants: IconVariant[];
  selectedVariant?: IconVariant;
  onChange: (selected: IconVariant) => void;
}

const IconButtonGroup: FC<IconButtonGroupProps> = props => {
  const { variants, selectedVariant = variants[0], onChange } = props;

  const onClick = useCallback((value: IconVariant) => onChange(value), [onChange]);

  return (
    <div className="tc__iconButtonGroup">
      {variants.map(variant => (
        <IconButton key={variant} variant={variant} onClick={onClick} selected={variant === selectedVariant} />
      ))}
    </div>
  );
};
export default IconButtonGroup;
