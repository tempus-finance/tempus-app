import { DataTypeProvider } from '@devexpress/dx-react-grid';
import AvailableToDepositFormatter from './availableToDepositFormatter';

const AvailableToDepositProvider = (props: any) => (
  <DataTypeProvider formatterComponent={AvailableToDepositFormatter} {...props} />
);

export default AvailableToDepositProvider;
