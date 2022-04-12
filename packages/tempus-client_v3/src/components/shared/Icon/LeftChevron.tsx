import { FC } from 'react';
import IconProps from './IconProps';
import { ICON_SIZE_DEFAULT } from './IconConstants';
import withIcon from './withIcon';

const LeftChevron: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-left-chevron"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.7636 14.4757C11.8385 14.5583 11.898 14.6565 11.9385 14.7648C11.9791 14.873 12 14.9892 12 15.1064C12 15.2237 11.9791 15.3398 11.9385 15.4481C11.898 15.5564 11.8385 15.6546 11.7636 15.7372C11.6894 15.8205 11.601 15.8866 11.5036 15.9317C11.4062 15.9768 11.3018 16 11.1963 16C11.0908 16 10.9864 15.9768 10.889 15.9317C10.7916 15.8866 10.7032 15.8205 10.629 15.7372L4.23636 8.63001C4.16147 8.54742 4.10202 8.44916 4.06145 8.3409C4.02089 8.23264 4 8.11652 4 7.99924C4 7.88196 4.02089 7.76584 4.06145 7.65758C4.10202 7.54932 4.16147 7.45107 4.23636 7.36848L10.629 0.261271C10.7794 0.0939821 10.9835 0 11.1963 0C11.3017 0 11.406 0.0230732 11.5033 0.0679022C11.6007 0.112731 11.6891 0.178438 11.7636 0.261271C11.8381 0.344104 11.8972 0.442442 11.9376 0.550669C11.9779 0.658895 11.9986 0.774892 11.9986 0.892036C11.9986 1.00918 11.9779 1.12518 11.9376 1.2334C11.8972 1.34163 11.8381 1.43997 11.7636 1.5228L5.9304 7.99924L11.7636 14.4757Z"
      fill="#062330"
    />
  </svg>
);

export default withIcon(LeftChevron);
