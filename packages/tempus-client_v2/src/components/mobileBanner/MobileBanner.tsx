import Typography from '../typography/Typography';

import './MobileBanner.scss';

const MobileBanner = () => {
  return (
    <div className="tf__mobile-banner">
      <Typography variant="h3" align="center">
        We currently do not support mobile, please use desktop for now.
      </Typography>
    </div>
  );
};
export default MobileBanner;
