import { FC } from 'react';
import IconProps from './IconProps';
import { ICON_SIZE_DEFAULT } from './IconConstants';
import withIcon from './withIcon';

const CheckmarkSolid: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-checkmark-solid"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="8" cy="8" r="8" fill="#4BB543" />
    <path d="M4 8.05015L7 11L12 6L11 5L7 9L5 7L4 8.05015Z" fill="white" />
  </svg>
);

export default withIcon(CheckmarkSolid);
