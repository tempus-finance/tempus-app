import { FC } from 'react';
import { IconProps, ICON_COLOR_DEFAULT, ICON_SIZE_DEFAULT } from './Icon';
import withIcon from './withIcon';

const GridView: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT, color = ICON_COLOR_DEFAULT }) => (
  <svg
    className="tc__icon tc__icon-grid-view"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.2 0C0.537258 0 0 0.537259 0 1.2V11.4H11.4V0H1.2ZM12.6 0V11.4H24V1.2C24 0.537258 23.4627 0 22.8 0H12.6ZM24 12.6H12.6V24H22.8C23.4627 24 24 23.4627 24 22.8V12.6ZM11.4 24V12.6H0V22.8C0 23.4627 0.537259 24 1.2 24H11.4Z"
      fill={color}
    />
  </svg>
);

export default withIcon(GridView);
