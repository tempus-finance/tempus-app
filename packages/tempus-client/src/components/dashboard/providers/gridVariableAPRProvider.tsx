import { DataTypeProvider } from '@devexpress/dx-react-grid';
import VariableAPRFormatter from './variableAPRFormatter';

const GridVariableAPRProvider = (props: any) => (
  <DataTypeProvider formatterComponent={VariableAPRFormatter} {...props} />
);

export default GridVariableAPRProvider;
