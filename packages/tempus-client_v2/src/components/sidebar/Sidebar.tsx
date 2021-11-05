import { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getDataForPool, PoolDataContext } from '../../context/poolDataContext';
import { AdvancedTransactionView, BasicTransactionView, TransactionView } from '../../interfaces/TransactionView';
import getConfig from '../../utils/getConfig';
import shortenAccount from '../../utils/shortenAccount';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import TokenPairIcon from './tokenPairIcon/TokenPairIcon';

import './Sidebar.scss';

const basicViews: BasicTransactionView[] = ['Deposit', 'Withdraw'];
const advancedViews: AdvancedTransactionView[] = [
  'Mint',
  'Swap',
  'Provide Liquidity',
  'Remove Liquidity',
  'Early Redeem',
];

type SidebarOutProps = {
  onSelectedView: (selectedView: TransactionView) => void;
};

type SidebarInProps = {
  initialView: TransactionView;
};

type SidebarProps = SidebarInProps & SidebarOutProps;

const Sidebar: FC<SidebarProps> = ({ initialView, onSelectedView }) => {
  const { poolData, selectedPool } = useContext(PoolDataContext);

  const [selectedView, setSelectedView] = useState<TransactionView | null>(null);

  const activePoolData = useMemo(() => {
    return getDataForPool(selectedPool, poolData);
  }, [poolData, selectedPool]);

  const onItemClick = useCallback(
    (itemName: string) => {
      setSelectedView(itemName as TransactionView);
      onSelectedView(itemName as TransactionView);
    },
    [onSelectedView],
  );

  useEffect(() => {
    if (initialView) {
      setSelectedView(initialView);
    }
  }, [initialView]);

  const onPoolAddressClick = useCallback(() => {
    const config = getConfig();

    if (config.networkName === 'homestead') {
      window.open(`https://etherscan.io/address/${activePoolData.address}`, '_blank');
    } else {
      window.open(`https://${config.networkName}.etherscan.io/address/${activePoolData.address}`, '_blank');
    }
  }, [activePoolData.address]);

  return (
    <div className="tc__sidebar-container">
      <TokenPairIcon parentTicker={activePoolData.backingToken} childTicker={activePoolData.yieldBearingToken} />
      <Spacer size={5} />
      <Typography variant="h4">{activePoolData.yieldBearingToken} Pool</Typography>
      <Spacer size={10} />
      <div onClick={onPoolAddressClick} className="tc__sidebar-pool-link">
        <Typography variant="body-text" color="link">
          {shortenAccount(activePoolData.address)}
        </Typography>
      </div>

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
