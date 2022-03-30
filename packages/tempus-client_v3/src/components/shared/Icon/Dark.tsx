import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './index';
import withIcon from './withIcon';

const Dark: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.5316 12.5447C13.4735 12.5461 13.4157 12.5465 13.358 12.5461C10.0562 12.5247 7.27316 9.77717 7.27316 6.27825C7.27316 4.43083 8.06573 2.70504 9.40776 1.52671C9.44828 1.49113 9.48929 1.45605 9.53081 1.42149C9.71142 1.2711 9.9014 1.13037 10.1002 1.00028C10.1003 1.00021 10.1004 1.00014 10.1005 1.00007C10.1914 0.940605 10.2841 0.883364 10.3786 0.828438C10.6749 0.656188 10.6004 0.197281 10.2637 0.13375C10.1574 0.113732 10.0507 0.0959508 9.94379 0.0804142C9.94379 0.0804135 9.94379 0.0804129 9.94378 0.0804123C9.69033 0.0435858 9.43528 0.0193675 9.17953 0.00784169C9.09055 0.00383156 9.00148 0.00135791 8.91237 0.000424296C8.88576 0.000145512 8.85915 4.04828e-06 8.83253 0C4.50907 0 1 3.57847 1 8C1 12.4159 4.50356 16 8.83253 16C10.7802 16 12.5918 15.2703 13.9867 14.0236C14.0514 13.9658 14.1152 13.9069 14.178 13.8469C14.3694 13.6643 14.5522 13.4715 14.7256 13.2692C14.7256 13.2692 14.7256 13.2692 14.7256 13.2692C14.7907 13.1934 14.8544 13.1162 14.9167 13.0378C15.133 12.7656 14.8972 12.3681 14.563 12.4331C14.4504 12.455 14.3382 12.4736 14.2262 12.489C14.2262 12.489 14.2262 12.489 14.2262 12.489C13.9929 12.5212 13.7611 12.5396 13.5316 12.5447ZM11.6246 13.8357C10.7741 14.265 9.82422 14.5 8.83253 14.5C5.36242 14.5 2.5 11.6182 2.5 8C2.5 4.95397 4.52683 2.43468 7.23256 1.71001C6.2973 3.01812 5.77316 4.61093 5.77316 6.27825C5.77316 9.96853 8.30005 13.0235 11.6246 13.8357Z"
      fill="#222222"
    />
  </svg>
);

export default withIcon(Dark);
