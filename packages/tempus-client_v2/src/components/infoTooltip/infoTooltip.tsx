import { FC } from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import InfoIcon from '../icons/InfoIcon';

interface InfoToolTipProps {
  text: string;
}

const InfoTooltip: FC<InfoToolTipProps> = props => {
  return (
    <Tooltip title={props.text}>
      <IconButton size="small">
        <InfoIcon />
      </IconButton>
    </Tooltip>
  );
};
export default InfoTooltip;
