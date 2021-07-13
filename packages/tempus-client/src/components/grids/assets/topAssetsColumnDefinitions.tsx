import { GridCellParams } from '@material-ui/data-grid';
import TokenIcon from '../../tokenIcon/tokenIcon';

// TODO
// we need the Financial service for this - BLOCKED
// format/round the values ==> APY in %, TVL, Volume in millions/thousands (dynamically?)
const topAssetsColumns = [
  {
    field: 'ticker',
    headerName: 'Asset',
    flex: 1,
    renderCell: (params: GridCellParams) => (
      <div className="tf-top-assets-ticker">
        <TokenIcon token={params.row.ticker.toLowerCase()} />
        <span>{params.row.ticker}</span>
      </div>
    ),
  },
  {
    field: 'fixedAPY',
    headerName: 'Fixed APY',
    flex: 1,
    valueGetter: (params: any) => `${params.row.minFixedAPY} - ${params.row.maxFixedAPY}`,
  },
  {
    field: 'variableAPY',
    headerName: 'Variable APY',
    flex: 1,
    valueGetter: (params: any) => `${params.row.minVariableAPY} - ${params.row.maxVariableAPY}`,
  },
  {
    field: 'TVL',
    headerName: 'TVL',
    type: 'number',
    flex: 1,
  },
  {
    field: 'volume24h',
    headerName: 'Volume 24h',
    type: 'number',
    flex: 1,
  },
];

export default topAssetsColumns;
