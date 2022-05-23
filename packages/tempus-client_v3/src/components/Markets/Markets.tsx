import { FC } from 'react';
import MarketsSubheader from './MarketsSubheader';
import MarketsPools from './MarketsPools';
import './Markets.scss';

const Markets: FC = () => (
  <div className="tc__app__markets">
    <MarketsSubheader />
    <MarketsPools />
  </div>
);

export default Markets;
