// External libraries
import React, { FC } from 'react';

// External UI Components
import { TableHeaderRow } from '@devexpress/dx-react-grid-material-ui';
import { IconButton, Tooltip } from '@material-ui/core';

// External UI Icons
import { ErrorOutline } from '@material-ui/icons';

// Constants
import { variableAPYTooltipText } from '../../../constants';

const HeaderTitle: FC = props => {
  const onMouseOverTooltip = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <TableHeaderRow.Title>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {props.children === 'Variable APR' && (
          <Tooltip title={variableAPYTooltipText}>
            <IconButton size="small" onMouseOver={onMouseOverTooltip}>
              <ErrorOutline />
            </IconButton>
          </Tooltip>
        )}
        {props.children}
      </div>
    </TableHeaderRow.Title>
  );
};

export default HeaderTitle;
