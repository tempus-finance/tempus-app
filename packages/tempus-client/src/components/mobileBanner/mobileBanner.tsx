import Typography from '../typography/Typography';

import './mobileBanner.scss';

const MobileBanner = () => {
  return (
    <div className="tf__mobile-banner">
      <Typography variant="h3" align="center">
        We do not support mobile devices yet, stay tuned for updates!
      </Typography>
    </div>
  );
};
export default MobileBanner;
