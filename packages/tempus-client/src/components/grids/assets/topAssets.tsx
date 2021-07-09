import { DataGrid } from '@material-ui/data-grid';

function TopAssets(): JSX.Element {
  return (
    <div style={{ height: 200, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
}
export default TopAssets;

// TODO
// get the tokens/coins svgs?
// store them somewhere (maybe in public/tokens ?)

// TODO
// <TokenIcon type="ETH" />

// TODO
// the Asset column has to show the ticker name and the associated icon

// TODO
// we need the Financial service for this - BLOCKED
// format/round the values ==> APY in %, TVL, Volume in millions/thousands (dynamically?)
const columns = [
  { field: 'ticker', headerName: 'Asset', width: 150 },
  {
    field: 'fixedAPY',
    headerName: 'Fixed APY',
    width: 150,
    valueGetter: (params: any) => `${params.row.minFixedAPY} - ${params.row.maxFixedAPY}`,
  },
  {
    field: 'variableAPY',
    headerName: 'Variable APY',
    width: 150,
    valueGetter: (params: any) => `${params.row.minVariableAPY} - ${params.row.maxVariableAPY}`,
  },
  {
    field: 'TVL',
    headerName: 'TVL',
    width: 150,
  },
  {
    field: 'volume24h',
    headerName: 'Volume 24h',
    width: 180,
  },
];

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
];
