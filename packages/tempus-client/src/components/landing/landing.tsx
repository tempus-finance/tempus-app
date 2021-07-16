import Chart from '../charts/chart/chart';
import TopAssets from '../grids/assets/topAssets';
import Transactions from '../grids/transactions/transactions';

import './landing.scss';

function Landing(): JSX.Element {
  return (
    <div className="tf-landing-section-container">
      <div className="tf-tvl-chart-container">
        <Chart kind="TLV" title="Total Value Locked" />
      </div>
      <div className="tf-volume-chart-container">
        <Chart kind="VOLUME" title="Volume 24H" />
      </div>
      <div className="tf-asset-grid-container">
        <TopAssets />
      </div>
      <div className="tf-transactions-grid-container">
        <Transactions />
      </div>
    </div>
  );
}
export default Landing;
