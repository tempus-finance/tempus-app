import { FC, memo, useCallback } from 'react';
import { colors } from '../Colors';
import Icon, { IconVariant } from '../Icon';
import ButtonWrapper from '../ButtonWrapper';
import './IconButton.scss';

export interface IconButtonProps {
  variant: IconVariant;
  onClick: (value: IconVariant) => void;
  selected?: boolean;
}

const IconButton: FC<IconButtonProps> = props => {
  const { variant, selected = false, onClick } = props;

  const onButtonClick = useCallback(() => {
    onClick(variant);
  }, [onClick, variant]);

  return (
    <ButtonWrapper
      className={selected ? 'tc__iconButton__selected' : 'tc__iconButton__deselected'}
      onClick={onButtonClick}
      selected={selected}
    >
      <Icon variant={variant} color={selected ? colors.iconButtonSelectedIcon : colors.iconButtonIcon} />
    </ButtonWrapper>
  );
};
export default memo(IconButton);
