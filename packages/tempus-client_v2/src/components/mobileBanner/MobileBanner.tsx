import { useCallback, useContext } from 'react';
import Button from '@material-ui/core/Button';
import { LocaleContext } from '../../context/localeContext';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';

import './MobileBanner.scss';

const MobileBanner = () => {
  const { locale } = useContext(LocaleContext);

  const redirectToWebsite = useCallback(() => {
    window.open('https://tempus.finance', '_self');
  }, []);

  return (
    <div className="tf__mobile-banner">
      <Typography variant="dropdown-text" align="center">
        <div dangerouslySetInnerHTML={{ __html: getText('mobileNotSupported', locale) }} />
      </Typography>
      <Spacer size={20} />
      <Button color="primary" variant="contained" size="large" onClick={redirectToWebsite}>
        <Typography variant="button-text" align="center" color="inverted">
          {getText('mobileLink', locale)}
        </Typography>
      </Button>
    </div>
  );
};
export default MobileBanner;
