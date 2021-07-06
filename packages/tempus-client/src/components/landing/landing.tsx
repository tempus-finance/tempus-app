import Chart from '../charts/chart/chart';

import './landing.scss';

function Landing(): JSX.Element {
  return (
    <div className="landing-section-container">
      <div className="tvl-chart-container">
        <Chart kind="TLV" title="Total Value Locked" />
      </div>
      <div className="volume-chart-container">
        <Chart kind="VOLUME" title="Volume 24H" />
      </div>
    </div>
  );
}
export default Landing;
