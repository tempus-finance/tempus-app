import { Popper } from '@material-ui/core';
import React, { FC, useCallback, useRef, useState } from 'react';
import InfoIcon from '../icons/InfoIcon';
import Typography from '../typography/Typography';

import './infoTooltip.scss';

interface InfoToolTipProps {
  text: string;
}

const InfoTooltip: FC<InfoToolTipProps> = props => {
  const { text } = props;

  const anchorRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState<boolean>(false);

  const toggle = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    setOpen(prevState => !prevState);
  }, []);

  return (
    <div className="tc__infoTooltip">
      <div onClick={toggle} ref={anchorRef} className="tc__infoTooltip-icon">
        <InfoIcon />
      </div>
      <Popper open={open} anchorEl={anchorRef.current} placement="bottom-start" disablePortal>
        <div className="tc__infoTooltip-popup">
          <Typography variant="tooltip-card-text" html={text} />
        </div>
      </Popper>
      {open && <div className="tc__backdrop" onClick={toggle} />}
    </div>
  );
};
export default InfoTooltip;
