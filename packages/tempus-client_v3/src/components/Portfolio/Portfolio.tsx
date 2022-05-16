import { FC, useState } from 'react';
import PortfolioOverview from './PortfolioOverview';
import PortfolioSubheader, { PortfolioView } from './PortfolioSubheader';
import './Portfolio.scss';

const Portfolio: FC = () => {
  const [view, setView] = useState<PortfolioView>('overview');

  return (
    <div className="tc__app__portfolio">
      <PortfolioSubheader onViewChange={setView} />
      <div className="tc__app__portfolio-content">{view === 'overview' && <PortfolioOverview />}</div>
    </div>
  );
};

export default Portfolio;
