import { FC } from 'react';
import IconProps from './IconProps';
import { ICON_COLOR_DEFAULT, ICON_SIZE_DEFAULT } from './IconConstants';
import withIcon from './withIcon';

const CheckmarkBordered: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT, color = ICON_COLOR_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-checkmark-bordered"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
      fill={color}
    />
    <path d="M4 8.05015L7 11L12 6L11 5L7 9L5 7L4 8.05015Z" fill={color} />
  </svg>
);

export default withIcon(CheckmarkBordered);
