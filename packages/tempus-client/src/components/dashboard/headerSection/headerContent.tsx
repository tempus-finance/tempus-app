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
    <TableHeaderRow.Content column={props.column} align="right">
      {props.children}
      {props.column.tooltip && (
        <Tooltip title={props.column.tooltip}>
          <IconButton size="small">
            <InfoOutlined />
          </IconButton>
        </Tooltip>
      )}
    </TableHeaderRow.Content>
  );
};

export default HeaderContent;
