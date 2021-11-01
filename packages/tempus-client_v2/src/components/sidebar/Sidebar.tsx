import { useCallback, useState } from 'react';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import TokenPairIcon from './tokenPairIcon/TokenPairIcon';

import './Sidebar.scss';

const basicViews = ['Deposit', 'Withdraw'];
const advancedViews = ['Mint', 'Swap', 'Provide Liquidity', 'Remove Liquidity', 'Early Redeem'];

const Sidebar = () => {
  const [selectedView, setSelectedView] = useState<string>('Deposit');

  const onItemClick = useCallback((itemName: string) => {
    setSelectedView(itemName);
  }, []);

  return (
    <div className="tc__sidebar-container">
      {/* TODO Update ticker based on selected pool (will be added once we add dashboard grid) */}
      <TokenPairIcon parentTicker="ETH" childTicker="stETH" />
      <Spacer size={5} />
      <Typography variant="h4">
        {/* TODO Update ticker based on selected pool */}
        {'stETH'} Pool
      </Typography>
      <Spacer size={10} />
      <Typography variant="body-text" color="link">
        {/* TODO Show selected pool address here - it should be clickable, and it should open pool etherscan link in new tab */}
        {'0x123...50E'}
      </Typography>

      {/* Basic Section */}
      <div className="tc__sidebar-section-title">
        <Typography variant="h5" color="title">
          BASIC
        </Typography>
      </div>
      {basicViews.map(basicViewName => {
        const selected = selectedView === basicViewName;
        return (
          <div
            key={basicViewName}
            className={`tc__sidebar-view-item ${selected ? 'selected' : ''}`}
            onClick={() => onItemClick(basicViewName)}
          >
            <Typography variant="h5" color={selectedView === basicViewName ? 'inverted' : 'default'}>
              {basicViewName}
            </Typography>
          </div>
        );
      })}

      {/* Advanced Section */}
      <div className="tc__sidebar-section-title">
        <Typography variant="h5" color="title">
          ADVANCED
        </Typography>
      </div>
      {advancedViews.map(advancedViewName => {
        const selected = selectedView === advancedViewName;
        return (
          <div
            key={advancedViewName}
            className={`tc__sidebar-view-item ${selected ? 'selected' : ''}`}
            onClick={() => onItemClick(advancedViewName)}
          >
            <Typography variant="h5" color={selected ? 'inverted' : 'default'}>
              {advancedViewName}
            </Typography>
          </div>
        );
      })}
    </div>
  );
};
export default Sidebar;
