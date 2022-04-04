import { FC, memo, useCallback } from 'react';
import { colors } from '../Colors';
import Icon, { IconType } from '../Icon';
import ButtonWrapper from '../ButtonWrapper';
import './IconButton.scss';

interface IconButtonProps {
  type: IconType;
  onClick: (value: IconType) => void;
  selected?: boolean;
}

const IconButton: FC<IconButtonProps> = props => {
  const { type, selected = false, onClick } = props;

  const onButtonClick = useCallback(() => {
    onClick(type);
  }, [onClick, type]);

  return (
    <ButtonWrapper
      className={selected ? 'tc__iconButton__selected' : 'tc__iconButton__deselected'}
      onClick={onButtonClick}
    >
      <Icon type={type} color={selected ? colors.iconButtonSelectedIcon : colors.iconButtonIcon} />
    </ButtonWrapper>
  );
};
export default memo(IconButton);
