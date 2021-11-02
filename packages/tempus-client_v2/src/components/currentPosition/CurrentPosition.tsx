import { FC } from 'react';
import getText from '../../localisation/getText';
import SharedProps from '../../sharedProps';
import Typography from '../typography/Typography';
import './CurrentPosition.scss';

type CurrentPositionInProps = SharedProps;

const CurrentPosition: FC<CurrentPositionInProps> = ({ language }) => {
  return (
    <div className="tc__currentPosition">
      <Typography variant="h1">{getText('currentPosition', language)}</Typography>
      <div className="tc__currentPosition__body">
        <div className="tc__currentPosition__body__bar">
          <div className="tc__currentPosition__body__bar__1" />
          <div className="tc__currentPosition__body__bar__2" />
          <div className="tc__currentPosition__body__bar__3" />
          <div className="tc__currentPosition__body__bar__4" />
        </div>
        <div className="tc__currentPosition__body__item">
          <div className="tc__currentPosition__body__item__with-icon">
            <div className="tc__currentPosition__icon tc__currentPosition__icon-principals" />
            <Typography variant="h5">{getText('principals', language)}</Typography>
          </div>
          <Typography variant="h5">0.2143 (0.05434 {getText('staked', language)})</Typography>
        </div>
        <div className="tc__currentPosition__body__item">
          <div className="tc__currentPosition__body__item__with-icon">
            <div className="tc__currentPosition__icon tc__currentPosition__icon-yields" />
            <Typography variant="h5">{getText('yields', language)}</Typography>
          </div>
          <Typography variant="h5">0.9812 (0.07654 {getText('staked', language)})</Typography>
        </div>
      </div>
    </div>
  );
};

export default CurrentPosition;
