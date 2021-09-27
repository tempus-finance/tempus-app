// UI Components
import Chart from '../charts/chart/chart';
import Transactions from '../grids/transactions/transactions';

// Constants
import { volume24hTooltipText } from '../../constants';

// Style
import './statistics.scss';

function Statistics(): JSX.Element {
  return (
    <div className="tf-landing-section-container">
      <div className="tf-tvl-chart-container">
        <Chart kind="TLV" title="Total Value Locked" />
      </div>
      <div className="tf-volume-chart-container">
        <Chart kind="VOLUME" title="Volume 24H" tooltip={volume24hTooltipText} />
      </div>
      <div className="tf-transactions-grid-container">
        <Transactions />
      </div>
    </div>
  );
}
export default Statistics;
