import { FC } from 'react';
import getText from '../../localisation/getText';
import SharedProps from '../../sharedProps';
import Typography from '../typography/Typography';
import PercentageLabel from './percentageLabel/PercentageLabel';

import './Pool.scss';

type PoolInProps = SharedProps;

const Pool: FC<PoolInProps> = ({ language }) => {
  return (
    <div className="tc__pool">
      <Typography variant="card-title">{getText('pool', language)}</Typography>
      <div className="tc__pool__body">
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('marketImpliedYield', language)}
            </Typography>
          </div>
          <Typography variant="card-body-text" color="accent">
            5.52%
          </Typography>
        </div>
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('tvl', language)}
            </Typography>
          </div>
          <PercentageLabel percentage={15.5} />
          <Typography variant="card-body-text">$1.05B</Typography>
        </div>
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('volume', language)}
            </Typography>
          </div>
          <PercentageLabel percentage={-1.5} />
          <Typography variant="card-body-text">$0.94B</Typography>
        </div>
        <div className="tc__pool__body__item">
          <div className="tc__pool__body__item-title">
            <Typography variant="card-body-text" color="title">
              {getText('fees', language)}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pool;
