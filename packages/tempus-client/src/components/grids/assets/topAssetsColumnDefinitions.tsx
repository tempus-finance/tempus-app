import { GridCellParams, GridValueFormatterParams } from '@material-ui/data-grid';
import NumberUtils from '../../../services/NumberUtils';
import TokenIcon from '../../tokenIcon/tokenIcon';

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
    valueGetter: (params: any) =>
      `${NumberUtils.formatPercentage(params.row.minFixedAPY, 2)} - ${NumberUtils.formatPercentage(
        params.row.maxFixedAPY,
        2,
      )}`,
  },
  {
    field: 'variableAPY',
    headerName: 'Variable APY',
    flex: 1,
    valueGetter: (params: any) =>
      `${NumberUtils.formatPercentage(params.row.minVariableAPY, 2)} - ${NumberUtils.formatPercentage(
        params.row.maxVariableAPY,
        2,
      )}`,
  },
  {
    field: 'TVL',
    headerName: 'TVL',
    type: 'number',
    valueFormatter: ({ value }: GridValueFormatterParams) => NumberUtils.formatWithMultiplier(value, 2),
    flex: 1,
  },
  {
    field: 'volume24h',
    headerName: 'Volume 24h',
    type: 'number',
    valueFormatter: ({ value }: GridValueFormatterParams) => NumberUtils.formatWithMultiplier(value, 2),
    flex: 1,
  },
];

export default topAssetsColumns;
