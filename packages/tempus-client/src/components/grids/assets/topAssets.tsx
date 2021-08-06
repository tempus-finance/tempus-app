import { Typography } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import { Asset } from '../../../interfaces';
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
// get assets - discuss with Djorje

// TODO
// we need the Financial service for this - BLOCKED
// create a row for each asset => retrieve values with Financial service

const rows: Asset[] = [
  {
    id: 1,
    ticker: 'eth',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
  {
    id: 2,
    ticker: 'usdc',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
  {
    id: 3,
    ticker: 'aave',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
  {
    id: 4,
    ticker: 'comp',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
  {
    id: 5,
    ticker: 'dai',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
  {
    id: 6,
    ticker: 'tusd',
    minFixedAPY: 0.0312,
    maxFixedAPY: 0.1125,
    minVariableAPY: 0.0412,
    maxVariableAPY: 0.125,
    TVL: 262620000,
    volume24h: 100000,
  },
];
