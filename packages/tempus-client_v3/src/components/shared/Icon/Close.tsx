import { FC } from 'react';
import IconProps from './IconProps';
import { ICON_COLOR_DEFAULT, ICON_SIZE_DEFAULT } from './IconConstants';
import withIcon from './withIcon';

const Close: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT, color = ICON_COLOR_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-close"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.6081 13.7161C15.859 13.967 16 14.3073 16 14.6621C16 15.017 15.859 15.3572 15.6081 15.6081C15.3572 15.859 15.017 16 14.6621 16C14.3073 16 13.967 15.859 13.7161 15.6081L8 9.87872L2.2839 15.6081C2.033 15.859 1.6927 16 1.33788 16C0.98305 16 0.642756 15.859 0.391855 15.6081C0.140955 15.3572 0 15.017 0 14.6621C0 14.3073 0.140955 13.967 0.391855 13.7161L6.12128 8L0.391855 2.2839C0.140955 2.033 -2.64367e-09 1.6927 0 1.33788C2.64367e-09 0.98305 0.140955 0.642756 0.391855 0.391855C0.642756 0.140955 0.98305 2.64367e-09 1.33788 0C1.6927 -2.64367e-09 2.033 0.140955 2.2839 0.391855L8 6.12128L13.7161 0.391855C13.967 0.140955 14.3073 0 14.6621 0C15.017 0 15.3572 0.140955 15.6081 0.391855C15.859 0.642756 16 0.98305 16 1.33788C16 1.6927 15.859 2.033 15.6081 2.2839L9.87872 8L15.6081 13.7161Z"
      fill={color}
    />
  </svg>
);

export default withIcon(Close);
