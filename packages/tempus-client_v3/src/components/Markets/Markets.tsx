import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import MarketsSubheader from './MarketsSubheader';
import MarketsPools from './MarketsPools';
import './Markets.scss';

const Markets: FC = () => (
  <div className="tc__app__markets">
    <MarketsSubheader />
    <MarketsPools />
    <Outlet />
  </div>
);

export default Markets;
