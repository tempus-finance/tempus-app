import { Typography } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import topAssetsColumns from './topAssetsColumnDefinitions';

import './topAssets.scss';

const TopAssets = (): JSX.Element => {
  return (
    <div className="tf-top-assets">
      <Typography>Top Assets</Typography>
      <div className="tf-top-assets-grid">
        <DataGrid
          rows={rows}
          columns={topAssetsColumns}
          autoHeight={true}
          autoPageSize={true}
          hideFooterPagination={true}
        />
      </div>
    </div>
  );
};
export default TopAssets;

// TODO
// interface in src/interfaces folder
interface Asset {
  id: number;
  ticker: string;
  minFixedAPY: number;
  maxFixedAPY: number;
  minVariableAPY: number;
  maxVariableAPY: number;
  TVL: number;
  volume24h: number;
}

// TODO
// get assets - discuss with Djorje

// TODO
// we need the Financial service for this - BLOCKED
// create a row for each asset => retrieve values with Financial service

const rows: Asset[] = [
  {
    id: 1,
    ticker: 'ETH',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
  {
    id: 2,
    ticker: 'USDC',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
  {
    id: 3,
    ticker: 'AAVE',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
  {
    id: 4,
    ticker: 'COMP',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
  {
    id: 5,
    ticker: 'DAI',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
  {
    id: 6,
    ticker: 'TUSD',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
];
