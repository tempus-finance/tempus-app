import { FC, KeyboardEvent, useCallback } from 'react';
import { Table } from '@devexpress/dx-react-grid-material-ui';

const BodyRow: FC = (props: any) => {
  const isChild = !!props.row.parentId;

  const onKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      switch (ev.key) {
        case 'Space':
        case 'Enter':
          props.onClick?.();
      }
    },
    [props],
  );

  return isChild ? (
    <Table.Row {...props} className="tf__dashboard__body__row tf__dashboard__body__row-child" />
  ) : (
    <Table.Row
      {...props}
      className={`tf__dashboard__body__row tf__dashboard__body__row-parent ${props.expand ? 'expanded' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Expand"
      aria-expanded={props.expand}
      onClick={props.onClick}
      onKeyDown={onKeyDown}
    />
  );
};

export default BodyRow;
