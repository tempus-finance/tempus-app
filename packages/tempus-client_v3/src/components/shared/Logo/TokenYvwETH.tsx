import { FC } from 'react';
import LogoProps from './LogoProps';
import { LOGO_SIZE_DEFAULT } from './LogoConstants';
import withLogo from './withLogo';

const TokenYvwETH: FC<LogoProps> = ({ size = LOGO_SIZE_DEFAULT }) => (
  <svg
    className="tc__logo tc__logo-token-yvwETH"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="20" r="20" fill="white" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.6875 6.5625H5.3125V9.6875H9.6875L9.6875 13.4375H12.8125V9.6875V6.5625H9.6875Z"
      fill="#0657F9"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.0804 7.2425C17.411 6.80132 18.8339 6.5625 20.3125 6.5625C27.7338 6.5625 33.75 12.5787 33.75 20C33.75 27.4213 27.7338 33.4375 20.3125 33.4375C12.8912 33.4375 6.875 27.4213 6.875 20C6.875 16.0299 8.59669 12.462 11.3342 10.002L10.4479 6.69436C6.3836 9.71252 3.75 14.5487 3.75 20C3.75 29.1472 11.1653 36.5625 20.3125 36.5625C29.4597 36.5625 36.875 29.1472 36.875 20C36.875 10.8528 29.4597 3.4375 20.3125 3.4375C18.5543 3.4375 16.8601 3.71145 15.2703 4.219L16.0804 7.2425Z"
      fill="#0657F9"
    />
    <circle cx="19.6875" cy="20" r="8.78571" fill="black" stroke="black" strokeWidth="0.553576" />
    <circle cx="21.0648" cy="20.6224" r="8.78801" fill="white" stroke="black" strokeWidth="0.553576" />
    <path
      d="M15.0725 23.4375H15.7002L16.5167 20.0372H16.5289L17.3272 23.4375H17.9488L18.9542 19.2755H18.3814L17.9305 21.3656L17.6441 22.7611H17.6258L17.3272 21.3656L16.8336 19.2755H16.2303L15.7306 21.3656L15.4259 22.7672H15.4077L15.1273 21.3656L14.6703 19.2755H14.0853L15.0725 23.4375ZM19.4853 23.4375H21.7887L21.8253 22.9805H20.0337V21.5119H21.5572L21.5876 21.0548H20.0337V19.7386H21.7095L21.74 19.2755H19.4853V23.4375ZM23.2821 23.4375H23.8366V19.7447H24.9823L25.0127 19.2755H22.1426L22.106 19.7447H23.2821V23.4375ZM25.5017 23.4375H26.0501V21.5119H27.9392V23.4375H28.4876V19.2755H27.9392V21.0366H26.0501V19.2755H25.5017V23.4375Z"
      fill="black"
    />
    <path
      d="M15.0725 23.4375L14.9965 23.4555L15.0107 23.5156H15.0725V23.4375ZM15.7002 23.4375V23.5156H15.7617L15.7761 23.4557L15.7002 23.4375ZM16.5167 20.0372V19.9591H16.4551L16.4408 20.0189L16.5167 20.0372ZM16.5289 20.0372L16.605 20.0193L16.5908 19.9591H16.5289V20.0372ZM17.3272 23.4375L17.2511 23.4554L17.2653 23.5156H17.3272V23.4375ZM17.9488 23.4375V23.5156H18.0102L18.0247 23.4558L17.9488 23.4375ZM18.9542 19.2755L19.0302 19.2938L19.0535 19.1973H18.9542V19.2755ZM18.3814 19.2755V19.1973H18.3183L18.305 19.259L18.3814 19.2755ZM17.9305 21.3656L17.8541 21.3491L17.8539 21.3499L17.9305 21.3656ZM17.6441 22.7611V22.8392H17.7078L17.7206 22.7768L17.6441 22.7611ZM17.6258 22.7611L17.5494 22.7774L17.5626 22.8392H17.6258V22.7611ZM17.3272 21.3656L17.4036 21.3493L17.4032 21.3477L17.3272 21.3656ZM16.8336 19.2755L16.9096 19.2575L16.8954 19.1973H16.8336V19.2755ZM16.2303 19.2755V19.1973H16.1687L16.1543 19.2573L16.2303 19.2755ZM15.7306 21.3656L15.6546 21.3475L15.6543 21.349L15.7306 21.3656ZM15.4259 22.7672V22.8453H15.4889L15.5023 22.7838L15.4259 22.7672ZM15.4077 22.7672L15.331 22.7825L15.3436 22.8453H15.4077V22.7672ZM15.1273 21.3656L15.204 21.3503L15.2037 21.3489L15.1273 21.3656ZM14.6703 19.2755L14.7466 19.2588L14.7332 19.1973H14.6703V19.2755ZM14.0853 19.2755V19.1973H13.9865L14.0093 19.2935L14.0853 19.2755ZM15.0725 23.5156H15.7002V23.3594H15.0725V23.5156ZM15.7761 23.4557L16.5927 20.0554L16.4408 20.0189L15.6242 23.4193L15.7761 23.4557ZM16.5167 20.1153H16.5289V19.9591H16.5167V20.1153ZM16.4528 20.055L17.2511 23.4554L17.4032 23.4196L16.605 20.0193L16.4528 20.055ZM17.3272 23.5156H17.9488V23.3594H17.3272V23.5156ZM18.0247 23.4558L19.0302 19.2938L18.8783 19.2571L17.8728 23.4192L18.0247 23.4558ZM18.9542 19.1973H18.3814V19.3536H18.9542V19.1973ZM18.305 19.259L17.8541 21.3491L18.0068 21.3821L18.4578 19.2919L18.305 19.259ZM17.8539 21.3499L17.5675 22.7454L17.7206 22.7768L18.007 21.3813L17.8539 21.3499ZM17.6441 22.683H17.6258V22.8392H17.6441V22.683ZM17.7022 22.7447L17.4036 21.3493L17.2508 21.382L17.5494 22.7774L17.7022 22.7447ZM17.4032 21.3477L16.9096 19.2575L16.7576 19.2934L17.2512 21.3836L17.4032 21.3477ZM16.8336 19.1973H16.2303V19.3536H16.8336V19.1973ZM16.1543 19.2573L15.6546 21.3475L15.8066 21.3838L16.3063 19.2936L16.1543 19.2573ZM15.6543 21.349L15.3496 22.7506L15.5023 22.7838L15.807 21.3822L15.6543 21.349ZM15.4259 22.6891H15.4077V22.8453H15.4259V22.6891ZM15.4843 22.7519L15.204 21.3503L15.0507 21.3809L15.331 22.7825L15.4843 22.7519ZM15.2037 21.3489L14.7466 19.2588L14.594 19.2922L15.051 21.3823L15.2037 21.3489ZM14.6703 19.1973H14.0853V19.3536H14.6703V19.1973ZM14.0093 19.2935L14.9965 23.4555L15.1485 23.4195L14.1613 19.2574L14.0093 19.2935ZM19.4853 23.4375H19.4072V23.5156H19.4853V23.4375ZM21.7887 23.4375V23.5156H21.8608L21.8666 23.4437L21.7887 23.4375ZM21.8253 22.9805L21.9032 22.9867L21.9099 22.9023H21.8253V22.9805ZM20.0337 22.9805H19.9556V23.0586H20.0337V22.9805ZM20.0337 21.5119V21.4337H19.9556V21.5119H20.0337ZM21.5572 21.5119V21.59H21.6302L21.6351 21.5171L21.5572 21.5119ZM21.5876 21.0548L21.6656 21.06L21.6711 20.9767H21.5876V21.0548ZM20.0337 21.0548H19.9556V21.133H20.0337V21.0548ZM20.0337 19.7386V19.6605H19.9556V19.7386H20.0337ZM21.7095 19.7386V19.8167H21.7827L21.7875 19.7437L21.7095 19.7386ZM21.74 19.2755L21.8179 19.2806L21.8234 19.1973H21.74V19.2755ZM19.4853 19.2755V19.1973H19.4072V19.2755H19.4853ZM19.4853 23.5156H21.7887V23.3594H19.4853V23.5156ZM21.8666 23.4437L21.9032 22.9867L21.7474 22.9742L21.7108 23.4313L21.8666 23.4437ZM21.8253 22.9023H20.0337V23.0586H21.8253V22.9023ZM20.1118 22.9805V21.5119H19.9556V22.9805H20.1118ZM20.0337 21.59H21.5572V21.4337H20.0337V21.59ZM21.6351 21.5171L21.6656 21.06L21.5097 21.0496L21.4792 21.5067L21.6351 21.5171ZM21.5876 20.9767H20.0337V21.133H21.5876V20.9767ZM20.1118 21.0548V19.7386H19.9556V21.0548H20.1118ZM20.0337 19.8167H21.7095V19.6605H20.0337V19.8167ZM21.7875 19.7437L21.8179 19.2806L21.662 19.2703L21.6315 19.7335L21.7875 19.7437ZM21.74 19.1973H19.4853V19.3536H21.74V19.1973ZM19.4072 19.2755V23.4375H19.5634V19.2755H19.4072ZM23.2821 23.4375H23.204V23.5156H23.2821V23.4375ZM23.8366 23.4375V23.5156H23.9148V23.4375H23.8366ZM23.8366 19.7447V19.6666H23.7585V19.7447H23.8366ZM24.9823 19.7447V19.8228H25.0555L25.0602 19.7497L24.9823 19.7447ZM25.0127 19.2755L25.0907 19.2805L25.0961 19.1973H25.0127V19.2755ZM22.1426 19.2755V19.1973H22.0703L22.0647 19.2694L22.1426 19.2755ZM22.106 19.7447L22.0281 19.7386L22.0216 19.8228H22.106V19.7447ZM23.2821 19.7447H23.3602V19.6666H23.2821V19.7447ZM23.2821 23.5156H23.8366V23.3594H23.2821V23.5156ZM23.9148 23.4375V19.7447H23.7585V23.4375H23.9148ZM23.8366 19.8228H24.9823V19.6666H23.8366V19.8228ZM25.0602 19.7497L25.0907 19.2805L24.9348 19.2704L24.9043 19.7396L25.0602 19.7497ZM25.0127 19.1973H22.1426V19.3536H25.0127V19.1973ZM22.0647 19.2694L22.0281 19.7386L22.1839 19.7508L22.2205 19.2815L22.0647 19.2694ZM22.106 19.8228H23.2821V19.6666H22.106V19.8228ZM23.204 19.7447V23.4375H23.3602V19.7447H23.204ZM25.5017 23.4375H25.4235V23.5156H25.5017V23.4375ZM26.0501 23.4375V23.5156H26.1282V23.4375H26.0501ZM26.0501 21.5119V21.4337H25.972V21.5119H26.0501ZM27.9392 21.5119H28.0173V21.4337H27.9392V21.5119ZM27.9392 23.4375H27.861V23.5156H27.9392V23.4375ZM28.4876 23.4375V23.5156H28.5657V23.4375H28.4876ZM28.4876 19.2755H28.5657V19.1973H28.4876V19.2755ZM27.9392 19.2755V19.1973H27.861V19.2755H27.9392ZM27.9392 21.0366V21.1147H28.0173V21.0366H27.9392ZM26.0501 21.0366H25.972V21.1147H26.0501V21.0366ZM26.0501 19.2755H26.1282V19.1973H26.0501V19.2755ZM25.5017 19.2755V19.1973H25.4235V19.2755H25.5017ZM25.5017 23.5156H26.0501V23.3594H25.5017V23.5156ZM26.1282 23.4375V21.5119H25.972V23.4375H26.1282ZM26.0501 21.59H27.9392V21.4337H26.0501V21.59ZM27.861 21.5119V23.4375H28.0173V21.5119H27.861ZM27.9392 23.5156H28.4876V23.3594H27.9392V23.5156ZM28.5657 23.4375V19.2755H28.4095V23.4375H28.5657ZM28.4876 19.1973H27.9392V19.3536H28.4876V19.1973ZM27.861 19.2755V21.0366H28.0173V19.2755H27.861ZM27.9392 20.9584H26.0501V21.1147H27.9392V20.9584ZM26.1282 21.0366V19.2755H25.972V21.0366H26.1282ZM26.0501 19.1973H25.5017V19.3536H26.0501V19.1973ZM25.4235 19.2755V23.4375H25.5798V19.2755H25.4235Z"
      fill="black"
    />
  </svg>
);

export default withLogo(TokenYvwETH);
