import { FC } from 'react';
import IconProps from './IconProps';
import { ICON_COLOR_DEFAULT, ICON_SIZE_DEFAULT } from './IconConstants';
import withIcon from './withIcon';

const DownArrow: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT, color = ICON_COLOR_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-down-arrow"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.18904 15.7043L0.335909 9.70648C0.229413 9.61328 0.144934 9.50263 0.087299 9.38085C0.0296637 9.25907 -6.58329e-09 9.12855 0 8.99674C6.58329e-09 8.86493 0.0296638 8.73441 0.087299 8.61263C0.144934 8.49085 0.229413 8.3802 0.335909 8.287C0.442405 8.19379 0.568834 8.11986 0.707978 8.06942C0.847122 8.01897 0.996254 7.99301 1.14686 7.99301C1.29747 7.99301 1.4466 8.01897 1.58575 8.06942C1.72489 8.11986 1.85132 8.19379 1.95782 8.287L6.85781 12.5854L6.85781 0.999638C6.85781 0.734517 6.97815 0.480256 7.19235 0.292787C7.40655 0.105319 7.69707 -1.15888e-08 8 0C8.30293 1.15888e-08 8.59345 0.105319 8.80765 0.292787C9.02185 0.480256 9.14219 0.734517 9.14219 0.999638L9.14219 12.5854L14.0422 8.287C14.2573 8.09876 14.549 7.99301 14.8531 7.99301C15.1573 7.99301 15.449 8.09876 15.6641 8.287C15.8792 8.47523 16 8.73053 16 8.99674C16 9.26294 15.8792 9.51825 15.6641 9.70648L8.81095 15.7043C8.70477 15.798 8.57845 15.8724 8.43926 15.9231C8.30007 15.9739 8.15078 16 8 16C7.84922 16 7.69993 15.9739 7.56074 15.9231C7.42155 15.8724 7.29523 15.798 7.18904 15.7043Z"
      fill={color}
    />
  </svg>
);

export default withIcon(DownArrow);
