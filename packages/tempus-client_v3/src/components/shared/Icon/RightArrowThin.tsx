import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './Icon';
import withIcon from './withIcon';

const RightArrowThin: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-right-arrow-thin"
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.8326 5.61591C12.0558 5.82804 12.0558 6.17196 11.8326 6.38409L8.19608 9.8409C7.97293 10.053 7.61112 10.053 7.38796 9.8409C7.1648 9.62878 7.1648 9.28485 7.38796 9.07272L10.049 6.54319H0L4.74868e-08 5.45681H10.049L7.38796 2.92728C7.1648 2.71515 7.1648 2.37122 7.38796 2.1591C7.61112 1.94697 7.97293 1.94697 8.19608 2.1591L11.8326 5.61591Z"
      fill="#F5AC37"
    />
  </svg>
);

export default withIcon(RightArrowThin);
