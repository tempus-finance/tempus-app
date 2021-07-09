import Chart from '../charts/chart/chart';
import TopAssets from '../grids/assets/topAssets';

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
    </div>
  );
}
export default Landing;
