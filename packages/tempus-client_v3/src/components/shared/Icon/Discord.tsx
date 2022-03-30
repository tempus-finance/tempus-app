import React, { FC } from 'react';
import { IconProps, ICON_SIZE_DEFAULT } from './index';
import withIcon from './withIcon';

const Discord: FC<IconProps> = ({ size = ICON_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.5446 2.99527C12.5246 2.53528 11.4313 2.19529 10.288 2.00197C10.2778 2.00001 10.2673 2.00127 10.2579 2.00557C10.2484 2.00987 10.2406 2.017 10.2354 2.02597C10.0954 2.27196 9.93937 2.59262 9.83004 2.84594C8.61747 2.66477 7.38471 2.66477 6.17214 2.84594C6.05037 2.56519 5.91305 2.29144 5.76082 2.02597C5.75566 2.01689 5.74785 2.0096 5.73844 2.00507C5.72903 2.00055 5.71847 1.999 5.70816 2.00063C4.56552 2.19396 3.47222 2.53395 2.45158 2.9946C2.4428 2.99829 2.43536 3.00457 2.43025 3.0126C0.355643 6.06252 -0.213007 9.0371 0.0663185 11.9743C0.0670958 11.9815 0.0693288 11.9885 0.0728816 11.9948C0.0764344 12.0011 0.0812327 12.0066 0.0869846 12.011C1.29788 12.8926 2.64847 13.5642 4.0822 13.9976C4.0922 14.0007 4.10289 14.0007 4.11288 13.9976C4.12287 13.9945 4.13169 13.9885 4.1382 13.9803C4.44619 13.567 4.72085 13.1303 4.95551 12.6717C4.96951 12.645 4.95618 12.613 4.92818 12.6023C4.49753 12.4402 4.08026 12.2444 3.68021 12.017C3.67303 12.0129 3.66697 12.0071 3.66259 12.0001C3.6582 11.993 3.65563 11.985 3.6551 11.9768C3.65457 11.9685 3.65611 11.9603 3.65956 11.9527C3.66301 11.9452 3.66827 11.9387 3.67488 11.9337C3.75888 11.8717 3.84288 11.807 3.92287 11.7424C3.93007 11.7365 3.93875 11.7328 3.94793 11.7317C3.95711 11.7305 3.96644 11.7319 3.97487 11.7357C6.5928 12.9117 9.42805 12.9117 12.0153 11.7357C12.0238 11.7316 12.0332 11.7301 12.0425 11.7311C12.0518 11.7322 12.0606 11.7358 12.068 11.7417C12.148 11.807 12.2313 11.8717 12.316 11.9337C12.3226 11.9386 12.328 11.945 12.3315 11.9525C12.3351 11.9599 12.3368 11.9682 12.3364 11.9764C12.336 11.9847 12.3335 11.9927 12.3293 11.9998C12.325 12.0069 12.3191 12.0128 12.312 12.017C11.9133 12.2463 11.4987 12.4403 11.0633 12.6017C11.0566 12.6041 11.0506 12.6079 11.0455 12.6129C11.0404 12.6178 11.0364 12.6238 11.0338 12.6305C11.0312 12.6371 11.0301 12.6442 11.0305 12.6513C11.0308 12.6584 11.0327 12.6653 11.036 12.6717C11.276 13.1296 11.5507 13.5656 11.8526 13.9796C11.8589 13.9881 11.8677 13.9945 11.8777 13.9978C11.8877 14.0011 11.8985 14.0013 11.9086 13.9983C13.3448 13.5661 14.6976 12.8942 15.9099 12.011C15.9158 12.0069 15.9207 12.0015 15.9244 11.9953C15.9281 11.9891 15.9304 11.9822 15.9312 11.975C16.2645 8.57911 15.3725 5.62853 13.5653 3.01394C13.5608 3.00544 13.5535 2.99882 13.5446 2.99527ZM5.34683 10.1857C4.55886 10.1857 3.90887 9.47308 3.90887 8.59911C3.90887 7.72447 4.54619 7.01249 5.34683 7.01249C6.15348 7.01249 6.79746 7.73047 6.78479 8.59911C6.78479 9.47375 6.14748 10.1857 5.34683 10.1857ZM10.6633 10.1857C9.8747 10.1857 9.22539 9.47308 9.22539 8.59911C9.22539 7.72447 9.86203 7.01249 10.6633 7.01249C11.47 7.01249 12.114 7.73047 12.1013 8.59911C12.1013 9.47375 11.4707 10.1857 10.6633 10.1857Z"
      fill="#222222"
    />
  </svg>
);

export default withIcon(Discord);
