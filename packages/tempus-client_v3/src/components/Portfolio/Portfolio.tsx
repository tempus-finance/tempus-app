import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import PortfolioSubheader from './PortfolioSubheader';

import './Portfolio.scss';

const Portfolio: FC = () => (
  <div className="tc__app__portfolio">
    <PortfolioSubheader />
    <div className="tc__app__portfolio-content">
      <Outlet />
    </div>
  </div>
);

export default Portfolio;
