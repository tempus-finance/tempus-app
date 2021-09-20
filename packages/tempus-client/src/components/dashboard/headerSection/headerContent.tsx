import { FC } from 'react';
import { TableHeaderRow } from '@devexpress/dx-react-grid-material-ui';
import Typography from '../../typography/Typography';
import { ExtraDataColumn } from '../dashboardColumnsDefinitions';
import InfoTooltip from '../../infoTooltip/infoTooltip';

interface ContentProps extends TableHeaderRow.ContentProps {
  column: ExtraDataColumn;
}

const HeaderContent: FC<ContentProps> = props => {
  return (
    <TableHeaderRow.Content column={props.column} align="left">
      {props.column.tooltip ? (
        <>
          <Typography color="default" variant="h5">
            {props.children}
          </Typography>
          <div style={{ marginRight: '4px' }}>
            <InfoTooltip text={props.column.tooltip} />
          </div>
        </>
      ) : (
        <Typography color="default" variant="h5">
          {props.children}
        </Typography>
      )}
    </TableHeaderRow.Content>
  );
};

export default HeaderContent;
