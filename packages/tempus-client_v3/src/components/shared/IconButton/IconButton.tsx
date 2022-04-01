import { FC, memo } from 'react';
import { colors } from '../Colors';
import Icon, { IconType } from '../Icon/Icon';
import './IconButton.scss';

interface IconButtonProps {
  type: IconType;
  selected?: boolean;
}

const IconButton: FC<IconButtonProps> = props => {
  const { type, selected = false } = props;

  return (
    <div className={selected ? 'tc__iconButton__selected' : 'tc__iconButton__deselected'}>
      <Icon type={type} color={selected ? colors.iconButtonSelectedIcon : colors.iconButtonIcon} />
    </div>
  );
};
export default memo(IconButton);
