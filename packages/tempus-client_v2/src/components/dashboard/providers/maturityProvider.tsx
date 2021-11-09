import { DataTypeProvider } from '@devexpress/dx-react-grid';
import MaturityFormatter from './maturityFormatter';

const MaturityProvider = (props: any) => <DataTypeProvider formatterComponent={MaturityFormatter} {...props} />;

export default MaturityProvider;
