import PoolDataAdapter from '../../adapters/PoolDataAdapter';
import SharedProps from '../../sharedProps';

type OperationsSharedProps = {
  poolDataAdapter: PoolDataAdapter | null;
} & SharedProps;

export default OperationsSharedProps;
