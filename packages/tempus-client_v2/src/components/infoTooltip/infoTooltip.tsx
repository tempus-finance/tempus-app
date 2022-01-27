import { Popper } from '@material-ui/core';
import React, { FC, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import InfoIcon from '../icons/InfoIcon';
import Typography from '../typography/Typography';

import './infoTooltip.scss';

interface InfoToolTipProps {
  content: string | ReactNode;
}

const InfoTooltip: FC<InfoToolTipProps> = props => {
  const { content, children = <InfoIcon /> } = props;

  const [open, setOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    setOpen(prevState => !prevState);
  }, []);
  const popupAnchor = useMemo(() => {
    if (children) {
      return (
        <div onClick={toggle} ref={anchorRef}>
          {children}
        </div>
      );
    }
    return (
      <div onClick={toggle} ref={anchorRef} className="tc__infoTooltip-icon">
        <InfoIcon />
      </div>
    );
  }, [children, toggle]);
  const popupContent = useMemo(() => {
    if (typeof content === 'string') {
      return <Typography variant="tooltip-card-text" html={content} />;
    }
    return content;
  }, [content]);

  return (
    <div className="tc__infoTooltip">
      <div className={`tc__infoTooltip-anchor ${open ? 'tc__infoTooltip-active' : ''}`}>{popupAnchor}</div>
      <Popper
        className="tc__infoTooltip__popper"
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        disablePortal
        modifiers={{
          arrow: {
            enabled: true,
            element: arrowRef.current,
          },
        }}
      >
        <div className="tc__infoTooltip-arrow" ref={arrowRef}></div>
        <div className="tc__infoTooltip-popup">{popupContent}</div>
      </Popper>
      {open && <div className="tc__backdrop" onClick={toggle} />}
    </div>
  );
};
export default InfoTooltip;
