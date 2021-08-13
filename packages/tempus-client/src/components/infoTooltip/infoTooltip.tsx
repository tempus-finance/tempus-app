// External Libraries
import { FC } from 'react';

// External UI Components
import { IconButton, Tooltip } from '@material-ui/core';

// External Icons
import { InfoOutlined } from '@material-ui/icons';

interface InfoToolTipProps {
  text: string;
}

const InfoTooltip: FC<InfoToolTipProps> = props => {
  return (
    <Tooltip title={props.text}>
      <IconButton size="small">
        <InfoOutlined />
      </IconButton>
    </Tooltip>
  );
};
export default InfoTooltip;
