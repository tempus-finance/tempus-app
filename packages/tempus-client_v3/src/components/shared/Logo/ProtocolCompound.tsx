import { FC } from 'react';
import { InnerLogoProps } from './LogoProps';
import withLogo from './withLogo';

const ProtocolCompound: FC<InnerLogoProps> = ({ size }) => (
  <svg
    className="tc__logo tc__logo-protocol-compound"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="nonzero"
      fill="#070A0E"
      d="M 20 40 C 31.046875 40 40 31.046875 40 20 C 40 8.953125 31.046875 0 20 0 C 8.953125 0 0 8.953125 0 20 C 0 31.046875 8.953125 40 20 40 Z M 20 40 "
    />
    <path
      fillRule="evenodd"
      fill="#00D395"
      d="M 11.554688 26.707031 C 10.957031 26.339844 10.589844 25.691406 10.589844 24.988281 L 10.589844 21.082031 C 10.589844 20.617188 10.96875 20.242188 11.433594 20.242188 C 11.578125 20.242188 11.726562 20.285156 11.855469 20.359375 L 20.671875 25.5 C 21.1875 25.800781 21.507812 26.351562 21.507812 26.949219 L 21.507812 30.996094 C 21.507812 31.554688 21.058594 32.007812 20.503906 32.007812 C 20.316406 32.007812 20.132812 31.953125 19.972656 31.859375 Z M 24.699219 19.289062 C 25.214844 19.589844 25.53125 20.140625 25.53125 20.738281 L 25.53125 28.953125 C 25.53125 29.195312 25.402344 29.421875 25.191406 29.539062 L 23.261719 30.625 C 23.234375 30.636719 23.210938 30.648438 23.183594 30.65625 L 23.183594 26.09375 C 23.183594 25.503906 22.871094 24.957031 22.363281 24.652344 L 14.621094 20.019531 L 14.621094 14.871094 C 14.621094 14.40625 14.996094 14.03125 15.460938 14.03125 C 15.609375 14.03125 15.757812 14.070312 15.882812 14.144531 Z M 28.558594 13.21875 C 29.074219 13.519531 29.394531 14.074219 29.394531 14.671875 L 29.394531 26.671875 C 29.390625 26.917969 29.257812 27.144531 29.039062 27.261719 L 27.210938 28.25 L 27.210938 19.894531 C 27.210938 19.304688 26.898438 18.761719 26.394531 18.457031 L 18.480469 13.707031 L 18.480469 8.824219 C 18.480469 8.675781 18.519531 8.53125 18.59375 8.402344 C 18.824219 8.003906 19.339844 7.867188 19.738281 8.097656 Z M 28.558594 13.21875"
    />
  </svg>
);
export default withLogo(ProtocolCompound);