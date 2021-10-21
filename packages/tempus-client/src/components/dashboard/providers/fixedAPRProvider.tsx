import { DataTypeProvider } from '@devexpress/dx-react-grid';
import fixedAPRFormatter from './fixedAPRFormatter';

const FixedAPRProvider = (props: any) => <DataTypeProvider formatterComponent={fixedAPRFormatter} {...props} />;

export default FixedAPRProvider;
