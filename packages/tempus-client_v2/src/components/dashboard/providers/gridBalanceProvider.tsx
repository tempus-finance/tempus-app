import { DataTypeProvider } from '@devexpress/dx-react-grid';
import BalanceFormatter from './balanceFormatter';

const BalanceProvider = (props: any) => <DataTypeProvider formatterComponent={BalanceFormatter} {...props} />;

export default BalanceProvider;
