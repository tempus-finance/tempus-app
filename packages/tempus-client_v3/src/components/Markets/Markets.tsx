import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import MarketsSubheader from './MarketsSubheader';
import MarketsPools from './MarketsPools';
import MarketsSwitchNetworkFooter from './MarketsSwitchNetworkFooter';
import './Markets.scss';

const Markets: FC = () => (
  <div className="tc__app__markets">
    <div className="tc__app__markets-content">
      <MarketsSubheader />
      <MarketsPools />
    </div>
    <MarketsSwitchNetworkFooter />
    <Outlet />
  </div>
);

export default Markets;
