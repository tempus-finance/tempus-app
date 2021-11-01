import { DataTypeProvider } from '@devexpress/dx-react-grid';
import TVLFormatter from './tvlFormatter';

const TVLProvider = (props: any) => <DataTypeProvider formatterComponent={TVLFormatter} {...props} />;

export default TVLProvider;
