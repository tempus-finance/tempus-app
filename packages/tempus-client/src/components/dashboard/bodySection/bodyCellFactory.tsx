import { ColumnNames } from '../../../interfaces';
import BodyCell from './bodyCell';
import ProtocolCell from './protocolCell';

const BodyCellFactory = (props: any) => {
  const {
    column: { name: columnName },
  } = props;

  if (columnName === ColumnNames.PROTOCOL) {
    return <ProtocolCell {...props} />;
  }

  return <BodyCell {...props} />;
};

export default BodyCellFactory;
