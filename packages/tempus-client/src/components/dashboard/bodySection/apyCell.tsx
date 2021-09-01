import { FC } from 'react';
import { VirtualTable } from '@devexpress/dx-react-grid-material-ui';
import { Table } from '@devexpress/dx-react-grid';
import NumberUtils from '../../../services/NumberUtils';
import APYGraph from './apyGraph';

const APYCell: FC<Table.DataCellProps> = (props: Table.DataCellProps) => {
  const className = `tf__dashboard__body__cell tf__dashboard__body__apy-cell`;
  let apy;
  const isParent = !props.row.parentId;
  if (props.value.length === 2) {
    const [, max] = props.value;
    apy = max;
  } else {
    apy = props.value;
  }

  return (
    <VirtualTable.Cell {...props} className={className}>
      <div className="tf__dashboard__body__apy">
        {isParent ? (
          <div className="tf__dashboard__body__apy-value">
            up to{' '}
            <span
              style={{
                fontWeight: apy > 0.2 ? 600 : 400,
                color: apy > 0.2 ? '#ffdf99' : 'inherit',
              }}
            >
              {NumberUtils.formatPercentage(apy, 2)}
            </span>
          </div>
        ) : (
          ''
        )}
        {!isParent ? (
          <>
            <APYGraph apy={apy} />
            <div className="tf__dashboard__body__apy-value">{NumberUtils.formatPercentage(apy, 2)}</div>
          </>
        ) : undefined}
      </div>
    </VirtualTable.Cell>
  );
};

export default APYCell;
