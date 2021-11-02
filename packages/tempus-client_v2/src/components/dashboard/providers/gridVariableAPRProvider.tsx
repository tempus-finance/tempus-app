import { DataTypeProvider } from '@devexpress/dx-react-grid';
import VariableAPRFormatter from './variableAPRFormatter';

const VariableAPRProvider = (props: any) => <DataTypeProvider formatterComponent={VariableAPRFormatter} {...props} />;

export default VariableAPRProvider;
