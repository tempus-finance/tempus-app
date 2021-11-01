import { FC } from 'react';
import getText from '../../localisation/getText';
import SharedProps from '../../sharedProps';
import Typography from '../typography/Typography';
import './Pool.scss';

type PoolInProps = SharedProps;

const Pool: FC<PoolInProps> = ({ language }) => {
  return (
    <div className="tc__pool">
      <Typography variant="h1">{getText('pool', language)}</Typography>
      <div className="tc__pool_body">
        <div className="tc__pool_body__item">
          <Typography variant="h5">{getText('marketImpliedYield', language)}</Typography>
          <Typography variant="h5">5.52%</Typography>
        </div>
        <div className="tc__pool_body__item">
          <Typography variant="h5">{getText('tvl', language)}</Typography>
          <Typography variant="h5">$1.05B</Typography>
        </div>
        <div className="tc__pool_body__item">
          <Typography variant="h5">{getText('volume', language)}</Typography>
          <Typography variant="h5">$0.94B</Typography>
        </div>
        <div className="tc__pool_body__item">
          <Typography variant="h5">{getText('fees', language)}</Typography>
        </div>
      </div>
    </div>
  );
};

export default Pool;
