import { FC } from 'react';
import getText from '../../localisation/getText';
import SharedProps from '../../sharedProps';
import Typography from '../typography/Typography';
import './ProfitLoss.scss';

type ProfitLossInProps = SharedProps;

const ProfitLoss: FC<ProfitLossInProps> = ({ language }) => {
  return (
    <div className="tc__profitLoss">
      <Typography variant="h1">{getText('profitLoss', language)}</Typography>
      <div className="tc__profitLoss_body">
        <div className="tc__profitLoss_body__item">
          <Typography variant="h5">{getText('liquidationValue', language)}</Typography>
          <Typography variant="h5">0.21</Typography>
        </div>
      </div>
    </div>
  );
};

export default ProfitLoss;
