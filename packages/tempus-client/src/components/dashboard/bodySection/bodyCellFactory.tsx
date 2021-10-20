import { ColumnNames } from '../../../interfaces';
import BodyCell from './bodyCell';
import ProtocolCell from './protocolCell';
import APYCell from './apyCell';

const BodyCellFactory = (props: any) => {
  const {
    column: { name: columnName },
  } = props;

  if (columnName === ColumnNames.PROTOCOL) {
    return <ProtocolCell {...props} />;
  }

  if (columnName === ColumnNames.FIXED_APR) {
    return <APYCell {...props} />;
  }

  return <BodyCell {...props} />;
};

export default BodyCellFactory;
