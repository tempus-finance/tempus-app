import { FC } from 'react';
import IconProps from './IconProps';
import { ICON_SIZE_DEFAULT } from './IconConstants';
import withIcon from './withIcon';

const UpChevron: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-up-chevron"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_909_5449)">
      <path
        d="M15.7372 11.7636C15.6546 11.8385 15.5564 11.898 15.4481 11.9385C15.3398 11.9791 15.2237 12 15.1064 12C14.9892 12 14.873 11.9791 14.7648 11.9385C14.6565 11.898 14.5583 11.8385 14.4757 11.7636L7.99924 5.9304L1.5228 11.7636C1.35551 11.9141 1.12862 11.9986 0.892036 11.9986C0.655453 11.9986 0.42856 11.9141 0.261271 11.7636C0.0939821 11.6132 0 11.4091 0 11.1963C0 10.9835 0.0939821 10.7794 0.261271 10.629L7.36848 4.23636C7.45107 4.16147 7.54932 4.10202 7.65758 4.06145C7.76584 4.02089 7.88196 4 7.99924 4C8.11652 4 8.23264 4.02089 8.3409 4.06145C8.44916 4.10202 8.54742 4.16147 8.63001 4.23636L15.7372 10.629C15.8205 10.7032 15.8866 10.7916 15.9317 10.889C15.9768 10.9864 16 11.0908 16 11.1963C16 11.3018 15.9768 11.4062 15.9317 11.5036C15.8866 11.601 15.8205 11.6894 15.7372 11.7636Z"
        fill="#062330"
      />
    </g>
    <defs>
      <clipPath id="clip0_909_5449">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default withIcon(UpChevron);
