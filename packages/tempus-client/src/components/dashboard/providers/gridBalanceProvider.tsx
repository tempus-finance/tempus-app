import { DataTypeProvider } from '@devexpress/dx-react-grid';
import BalanceFormatter from './balanceFormatter';

const GridBalanceProvider = (props: any) => <DataTypeProvider formatterComponent={BalanceFormatter} {...props} />;

export default GridBalanceProvider;
