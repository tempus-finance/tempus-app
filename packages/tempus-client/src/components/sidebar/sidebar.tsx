import { FC } from 'react';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import PoolChart from '../poolChart';

import './sidebar.scss';

type SidebarInProps = {
  open: boolean;
  content?: any;
};

type SidebarOutProps = {
  onClose: () => void;
};

type SidebarProps = SidebarInProps & SidebarOutProps;

// TODO retrieve the values from the wallet
const getTokenValue = (token: string): string => {
  const valuesMap: { [id: string]: number } = {
    ETH: 12.123,
    stETH: 23.5679,
  };

  const value: number = valuesMap[token];

  return new Intl.NumberFormat('en-US').format(value);
};

const data = [
  { token: 'staked-principals', amount: 7 },
  { token: 'principals', amount: 12.34 },
  { token: 'yields', amount: 2 },
  { token: 'staked-yields', amount: 5 },
];

const Sidebar: FC<SidebarProps> = ({ open, content, onClose }) => {
  console.log('sidebar', content);
  const { supportedTokens } = content || {};

  return (
    <Drawer className="tf__sidebar-container" variant="persistent" anchor="left" open={open}>
      <div className="tf__sidebar__header">
        <IconButton onClick={onClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Divider />
      <div className="tf__sidebar__balances">
        <div className="tf__sidebar__title"> Balances</div>

        <div className="tf__sidebar__content">
          {content && (
            <>
              <div className="tf__sidebar__content-title">Available to Deposit</div>
              <div className="tf__sidebar__content-item">
                <span>{supportedTokens[0]}</span>
                <span>{getTokenValue(supportedTokens[0])}</span>
              </div>
              <div className="tf__sidebar__content-item">
                <span>{supportedTokens[1]}</span>
                <span>{getTokenValue(supportedTokens[1])}</span>
              </div>
              <div className="tf__sidebar__content-divider"></div>
              <div className="tf__sidebar__content-title">Current Position</div>
              <div className="tf__sidebar__content-item">
                <span>Principals</span>
                <span>10</span>
              </div>
              <div className="tf__sidebar__content-item">
                <span>Yields</span>
                <span>0</span>
              </div>
              <div className="tf__sidebar__content-item">
                <span>LP Token</span>
                <span>17.5</span>
              </div>
              <div className="tf__sidebar__content-item">
                <span>Share</span>
                <span>5.56%</span>
              </div>
              <div className="tf__sidebar__content-item">
                <PoolChart data={data} />
              </div>
              <div className="tf__sidebar__content-divider"></div>
              <div className="tf__sidebar__content-title">Selected Pool</div>
              <div className="tf__sidebar__content-item">
                <span>Value</span>
                <span>$50,123.12</span>
              </div>
              <div className="tf__sidebar__content-item">
                <span>APR</span>
                <span>6.12%</span>
              </div>
            </>
          )}
        </div>
      </div>
      <Divider />
    </Drawer>
  );
};

export default Sidebar;
