import Chart, { ChartType } from '../charts/chart/chart';

import './landing.scss';

function Landing(): JSX.Element {
  return (
    <div className='landing-section-container'>
      <div className='tvl-chart-container'>
        <Chart type={ChartType.TLV} title='Total Value Locked'/>
      </div>
      <div className='volume-chart-container'>
        <Chart type={ChartType.VOLUME} title='Volume 24H' />
      </div>
    </div>
  );
}
export default Landing;
