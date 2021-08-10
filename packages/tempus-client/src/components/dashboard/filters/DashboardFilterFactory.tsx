import { TableFilterRow } from '@devexpress/dx-react-grid-material-ui';
import { ProtocolName, Ticker } from '../../../interfaces';
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

const tickers: Ticker[] = ['eth', 'usdc'];
const protocolNames: ProtocolName[] = ['lido', 'aave'];

export default DashboardFilterFactory;
