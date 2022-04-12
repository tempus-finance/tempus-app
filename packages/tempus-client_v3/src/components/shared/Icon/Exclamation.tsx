import { FC } from 'react';
import IconProps from './IconProps';
import { ICON_SIZE_DEFAULT } from './IconConstants';
import withIcon from './withIcon';

const Exclamation: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-exclamation"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_280_1582)">
      <path
        d="M6 2.00627V7.97194C6 9.0803 6.89534 9.97881 7.9998 9.97881C9.10441 9.97881 9.99982 9.08006 9.9996 7.97154L9.99839 2.00587C9.99818 0.919708 9.13666 0.0309655 8.05474 0.00079082C6.92929 -0.0305978 6 0.876416 6 2.00627Z"
        fill="white"
      />
      <path
        d="M9.999 13.9939C9.99955 12.8854 9.10418 11.9859 7.9995 11.9859C6.89521 11.9859 6 12.8847 6 13.9929C6 15.1011 6.89521 16 7.9995 16C9.1034 16 9.99845 15.1017 9.999 13.9939Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_280_1582">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default withIcon(Exclamation);
