import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './Icon';
import withIcon from './withIcon';

const Github: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-github"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_63_441)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.92236 0C3.50236 0 -0.0776367 3.67055 -0.0776367 8.20235C-0.0776367 11.8319 2.21236 14.8975 5.39236 15.9843C5.79236 16.0561 5.94236 15.81 5.94236 15.5947C5.94236 15.3999 5.93236 14.754 5.93236 14.067C3.92236 14.4464 3.40236 13.5646 3.24236 13.1033C3.15236 12.8674 2.76236 12.1395 2.42236 11.9447C2.14236 11.7909 1.74236 11.4115 2.41236 11.4013C3.04236 11.391 3.49236 11.9959 3.64236 12.242C4.36236 13.4826 5.51236 13.134 5.97236 12.9187C6.04236 12.3855 6.25236 12.0267 6.48236 11.8216C4.70236 11.6166 2.84236 10.9091 2.84236 7.77173C2.84236 6.87972 3.15236 6.14151 3.66236 5.56735C3.58236 5.36229 3.30236 4.52155 3.74236 3.39372C3.74236 3.39372 4.41236 3.17841 5.94236 4.23446C6.58236 4.04991 7.26236 3.95763 7.94236 3.95763C8.62236 3.95763 9.30236 4.04991 9.94236 4.23446C11.4724 3.16816 12.1424 3.39372 12.1424 3.39372C12.5824 4.52155 12.3024 5.36229 12.2224 5.56735C12.7324 6.14151 13.0424 6.86947 13.0424 7.77173C13.0424 10.9194 11.1724 11.6166 9.39236 11.8216C9.68236 12.078 9.93236 12.5701 9.93236 13.3391C9.93236 14.4361 9.92236 15.3179 9.92236 15.5947C9.92236 15.81 10.0724 16.0664 10.4724 15.9843C12.0605 15.4346 13.4405 14.3881 14.4181 12.9921C15.3958 11.5961 15.9219 9.92094 15.9224 8.20235C15.9224 3.67055 12.3424 0 7.92236 0Z"
        fill="#222222"
      />
    </g>
    <defs>
      <clipPath id="clip0_63_441">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default withIcon(Github);
