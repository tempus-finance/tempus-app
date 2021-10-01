import { FC } from 'react';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import PieChartIcon from '@material-ui/icons/PieChart';
import Tooltip from '@material-ui/core/Tooltip';

import './walletBalance.scss';

type WalletBalanceProps = {};

const WalletBalance: FC<WalletBalanceProps> = () => {
  return (
    <>
      <div className="wallet-icon-container">
        <AccountBalanceWalletIcon />
      </div>
      <div className="wallet-data-container">
        <div>
          <span>ETH</span> <span>11.00345</span>
        </div>
        <div>
          <span>stETH</span> <span>10.123</span>
        </div>
        <div>
          <span>TPS</span> <span>123.45</span>
        </div>
        <div>
          <span>TYS</span> <span>42.006</span>
        </div>
        <div>
          <span>LP Tokens</span> <span>0.123</span>
        </div>
      </div>
      <div className="pie-icon-container">
        <PieChartIcon />
      </div>
      <Tooltip title="Share of pool">
        <div className="pool-data-container">
          <span>4.123%</span>
        </div>
      </Tooltip>
    </>
  );
};

export default WalletBalance;
