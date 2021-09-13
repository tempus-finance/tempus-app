// External libraries
import { FC } from 'react';

// External UI Components
import { TableHeaderRow } from '@devexpress/dx-react-grid-material-ui';
import { IconButton, Tooltip } from '@material-ui/core';

// External UI Icons
import { InfoOutlined } from '@material-ui/icons';

// Interfaces
import { ExtraDataColumn } from '../dashboardColumnsDefinitions';

interface ContentProps extends TableHeaderRow.ContentProps {
  column: ExtraDataColumn;
}

const HeaderContent: FC<ContentProps> = props => {
  return (
    <TableHeaderRow.Content column={props.column} align="left">
      {props.column.tooltip ? (
        <>
          {props.children}
          <Tooltip title={props.column.tooltip}>
            <IconButton size="small">
              <InfoOutlined />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        props.children
      )}
    </TableHeaderRow.Content>
  );
};

export default HeaderContent;
