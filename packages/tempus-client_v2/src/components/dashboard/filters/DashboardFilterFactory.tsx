import { TableFilterRow } from '@devexpress/dx-react-grid-material-ui';
import { ProtocolName } from '../../../interfaces/ProtocolName';
import { Ticker } from '../../../interfaces/Token';
import ChipFilter from './ChipFilter';

const DashboardFilterFactory = (props: any) => {
  const {
    column: { name: columnName },
  } = props;

  switch (columnName) {
    case 'token': {
      return <ChipFilter {...props} values={tickers} />;
    }

    case 'protocol': {
      return <ChipFilter {...props} values={protocolNames} />;
    }

    default: {
      return (
        <TableFilterRow.Cell {...props}>
          <></>
        </TableFilterRow.Cell>
      );
    }
  }
};

const tickers: Ticker[] = ['ETH', 'stETH'];
const protocolNames: ProtocolName[] = ['lido', 'aave'];

export default DashboardFilterFactory;
