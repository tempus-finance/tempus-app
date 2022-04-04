import React, { FC } from 'react';
import { LogoProps, LOGO_SIZE_DEFAULT } from './Logo';
import withLogo from './withLogo';

const TokenWETH: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="white" />
    <ellipse cx="16.9956" cy="29.9097" rx="10.2338" ry="2.69311" fill="black" />
    <circle cx="18.7017" cy="19.2282" r="11.5748" fill="#E82574" stroke="black" strokeWidth="0.729311" />
    <circle cx="21.6671" cy="20.3587" r="11.3172" fill="white" stroke="black" strokeWidth="0.712897" />
    <line x1="7.16048" y1="17.67" x2="10.3922" y2="19.4654" stroke="black" strokeWidth="0.897702" />
    <path d="M7.21118 21.2946L10.8918 23.2254L10.8919 24.257L7.27403 22.4174L7.21118 21.2946Z" fill="black" />
    <path
      d="M14.0143 23.6528H14.7915L15.8027 19.4422H15.8178L16.8063 23.6528H17.576L18.821 18.499H18.1117L17.5533 21.0872L17.1987 22.8152H17.176L16.8063 21.0872L16.1951 18.499H15.448L14.8293 21.0872L14.452 22.8227H14.4293L14.0822 21.0872L13.5163 18.499H12.7919L14.0143 23.6528ZM19.4409 23.6528H22.2932L22.3385 23.0868H20.12V21.2683H22.0065L22.0442 20.7024H20.12V19.0725H22.1951L22.2328 18.499H19.4409V23.6528ZM24.1047 23.6528H24.7914V19.08H26.21L26.2477 18.499H22.6937L22.6484 19.08H24.1047V23.6528ZM27.1927 23.6528H27.8719V21.2683H30.2111V23.6528H30.8902V18.499H30.2111V20.6797H27.8719V18.499H27.1927V23.6528Z"
      fill="black"
    />
    <path
      d="M14.0143 23.6528L13.9202 23.6751L13.9378 23.7495H14.0143V23.6528ZM14.7915 23.6528V23.7495H14.8678L14.8856 23.6754L14.7915 23.6528ZM15.8027 19.4422V19.3455H15.7264L15.7086 19.4196L15.8027 19.4422ZM15.8178 19.4422L15.912 19.4201L15.8944 19.3455H15.8178V19.4422ZM16.8063 23.6528L16.7121 23.6749L16.7296 23.7495H16.8063V23.6528ZM17.576 23.6528V23.7495H17.6521L17.67 23.6755L17.576 23.6528ZM18.821 18.499L18.9151 18.5217L18.9439 18.4022H18.821V18.499ZM18.1117 18.499V18.4022H18.0336L18.0171 18.4786L18.1117 18.499ZM17.5533 21.0872L17.4587 21.0668L17.4586 21.0677L17.5533 21.0872ZM17.1987 22.8152V22.9119H17.2776L17.2934 22.8346L17.1987 22.8152ZM17.176 22.8152L17.0814 22.8354L17.0978 22.9119H17.176V22.8152ZM16.8063 21.0872L16.9009 21.0669L16.9004 21.065L16.8063 21.0872ZM16.1951 18.499L16.2892 18.4767L16.2716 18.4022H16.1951V18.499ZM15.448 18.499V18.4022H15.3717L15.3539 18.4765L15.448 18.499ZM14.8293 21.0872L14.7352 21.0647L14.7347 21.0666L14.8293 21.0872ZM14.452 22.8227V22.9195H14.53L14.5465 22.8433L14.452 22.8227ZM14.4293 22.8227L14.3345 22.8417L14.35 22.9195H14.4293V22.8227ZM14.0822 21.0872L14.1771 21.0682L14.1767 21.0665L14.0822 21.0872ZM13.5163 18.499L13.6108 18.4783L13.5942 18.4022H13.5163V18.499ZM12.7919 18.499V18.4022H12.6695L12.6978 18.5213L12.7919 18.499ZM14.0143 23.7495H14.7915V23.556H14.0143V23.7495ZM14.8856 23.6754L15.8968 19.4648L15.7086 19.4196L14.6975 23.6302L14.8856 23.6754ZM15.8027 19.5389H15.8178V19.3455H15.8027V19.5389ZM15.7236 19.4643L16.7121 23.6749L16.9005 23.6307L15.912 19.4201L15.7236 19.4643ZM16.8063 23.7495H17.576V23.556H16.8063V23.7495ZM17.67 23.6755L18.9151 18.5217L18.727 18.4763L17.4819 23.6301L17.67 23.6755ZM18.821 18.4022H18.1117V18.5957H18.821V18.4022ZM18.0171 18.4786L17.4588 21.0668L17.6479 21.1076L18.2063 18.5194L18.0171 18.4786ZM17.4586 21.0677L17.1039 22.7957L17.2934 22.8346L17.6481 21.1066L17.4586 21.0677ZM17.1987 22.7184H17.176V22.9119H17.1987V22.7184ZM17.2706 22.7949L16.9009 21.067L16.7117 21.1074L17.0814 22.8354L17.2706 22.7949ZM16.9004 21.065L16.2892 18.4767L16.1009 18.5212L16.7121 21.1094L16.9004 21.065ZM16.1951 18.4022H15.448V18.5957H16.1951V18.4022ZM15.3539 18.4765L14.7352 21.0647L14.9234 21.1097L15.5421 18.5215L15.3539 18.4765ZM14.7347 21.0666L14.3575 22.8022L14.5465 22.8433L14.9238 21.1077L14.7347 21.0666ZM14.452 22.726H14.4293V22.9195H14.452V22.726ZM14.5242 22.8038L14.1771 21.0682L13.9874 21.1062L14.3345 22.8417L14.5242 22.8038ZM14.1767 21.0665L13.6108 18.4783L13.4218 18.5196L13.9877 21.1079L14.1767 21.0665ZM13.5163 18.4022H12.7919V18.5957H13.5163V18.4022ZM12.6978 18.5213L13.9202 23.6751L14.1085 23.6304L12.886 18.4767L12.6978 18.5213ZM19.4409 23.6528H19.3441V23.7495H19.4409V23.6528ZM22.2932 23.6528V23.7495H22.3825L22.3896 23.6605L22.2932 23.6528ZM22.3385 23.0868L22.4349 23.0945L22.4433 22.9901H22.3385V23.0868ZM20.12 23.0868H20.0233V23.1836H20.12V23.0868ZM20.12 21.2683V21.1716H20.0233V21.2683H20.12ZM22.0065 21.2683V21.365H22.097L22.103 21.2747L22.0065 21.2683ZM22.0442 20.7024L22.1407 20.7088L22.1476 20.6056H22.0442V20.7024ZM20.12 20.7024H20.0233V20.7991H20.12V20.7024ZM20.12 19.0725V18.9757H20.0233V19.0725H20.12ZM22.1951 19.0725V19.1692H22.2857L22.2916 19.0788L22.1951 19.0725ZM22.2328 18.499L22.3294 18.5053L22.3362 18.4022H22.2328V18.499ZM19.4409 18.499V18.4022H19.3441V18.499H19.4409ZM19.4409 23.7495H22.2932V23.556H19.4409V23.7495ZM22.3896 23.6605L22.4349 23.0945L22.2421 23.0791L22.1968 23.6451L22.3896 23.6605ZM22.3385 22.9901H20.12V23.1836H22.3385V22.9901ZM20.2168 23.0868V21.2683H20.0233V23.0868H20.2168ZM20.12 21.365H22.0065V21.1716H20.12V21.365ZM22.103 21.2747L22.1407 20.7088L21.9477 20.6959L21.9099 21.2619L22.103 21.2747ZM22.0442 20.6056H20.12V20.7991H22.0442V20.6056ZM20.2168 20.7024V19.0725H20.0233V20.7024H20.2168ZM20.12 19.1692H22.1951V18.9757H20.12V19.1692ZM22.2916 19.0788L22.3294 18.5053L22.1363 18.4926L22.0986 19.0661L22.2916 19.0788ZM22.2328 18.4022H19.4409V18.5957H22.2328V18.4022ZM19.3441 18.499V23.6528H19.5376V18.499H19.3441ZM24.1047 23.6528H24.008V23.7495H24.1047V23.6528ZM24.7914 23.6528V23.7495H24.8881V23.6528H24.7914ZM24.7914 19.08V18.9833H24.6947V19.08H24.7914ZM26.21 19.08V19.1767H26.3007L26.3066 19.0863L26.21 19.08ZM26.2477 18.499L26.3443 18.5052L26.351 18.4022H26.2477V18.499ZM22.6937 18.499V18.4022H22.6042L22.5972 18.4915L22.6937 18.499ZM22.6484 19.08L22.5519 19.0725L22.5438 19.1767H22.6484V19.08ZM24.1047 19.08H24.2015V18.9833H24.1047V19.08ZM24.1047 23.7495H24.7914V23.556H24.1047V23.7495ZM24.8881 23.6528V19.08H24.6947V23.6528H24.8881ZM24.7914 19.1767H26.21V18.9833H24.7914V19.1767ZM26.3066 19.0863L26.3443 18.5052L26.1512 18.4927L26.1135 19.0737L26.3066 19.0863ZM26.2477 18.4022H22.6937V18.5957H26.2477V18.4022ZM22.5972 18.4915L22.5519 19.0725L22.7448 19.0875L22.7901 18.5065L22.5972 18.4915ZM22.6484 19.1767H24.1047V18.9833H22.6484V19.1767ZM24.008 19.08V23.6528H24.2015V19.08H24.008ZM27.1927 23.6528H27.096V23.7495H27.1927V23.6528ZM27.8719 23.6528V23.7495H27.9686V23.6528H27.8719ZM27.8719 21.2683V21.1716H27.7751V21.2683H27.8719ZM30.2111 21.2683H30.3078V21.1716H30.2111V21.2683ZM30.2111 23.6528H30.1143V23.7495H30.2111V23.6528ZM30.8902 23.6528V23.7495H30.9869V23.6528H30.8902ZM30.8902 18.499H30.9869V18.4022H30.8902V18.499ZM30.2111 18.499V18.4022H30.1143V18.499H30.2111ZM30.2111 20.6797V20.7765H30.3078V20.6797H30.2111ZM27.8719 20.6797H27.7751V20.7765H27.8719V20.6797ZM27.8719 18.499H27.9686V18.4022H27.8719V18.499ZM27.1927 18.499V18.4022H27.096V18.499H27.1927ZM27.1927 23.7495H27.8719V23.556H27.1927V23.7495ZM27.9686 23.6528V21.2683H27.7751V23.6528H27.9686ZM27.8719 21.365H30.2111V21.1716H27.8719V21.365ZM30.1143 21.2683V23.6528H30.3078V21.2683H30.1143ZM30.2111 23.7495H30.8902V23.556H30.2111V23.7495ZM30.9869 23.6528V18.499H30.7935V23.6528H30.9869ZM30.8902 18.4022H30.2111V18.5957H30.8902V18.4022ZM30.1143 18.499V20.6797H30.3078V18.499H30.1143ZM30.2111 20.583H27.8719V20.7765H30.2111V20.583ZM27.9686 20.6797V18.499H27.7751V20.6797H27.9686ZM27.8719 18.4022H27.1927V18.5957H27.8719V18.4022ZM27.096 18.499V23.6528H27.2895V18.499H27.096Z"
      fill="black"
    />
  </svg>
);

export default withLogo(TokenWETH);