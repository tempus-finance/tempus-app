import React, { FC, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { Popper, PopperPlacementType } from '@material-ui/core';
import InfoIcon from '../icons/InfoIcon';
import Typography from '../typography/Typography';

import './infoTooltip.scss';

interface InfoToolTipProps {
  content: string | ReactNode;
  placement?: PopperPlacementType;
  arrowEnabled?: boolean;
  useExternalOpenState?: boolean;
  externalOpen?: boolean;
  disabled?: boolean;
  onExternalToggle?: () => void;
}

const InfoTooltip: FC<InfoToolTipProps> = props => {
  const {
    content,
    placement = 'bottom-start',
    arrowEnabled = true,
    useExternalOpenState = false,
    externalOpen = false,
    disabled = false,
    onExternalToggle = () => false,
    children = <InfoIcon />,
  } = props;

  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const internalToggle = useCallback((event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    event.stopPropagation();
    setInternalOpen(prevState => !prevState);
  }, []);
  const toggle = useMemo(
    () => (useExternalOpenState ? onExternalToggle : internalToggle),
    [useExternalOpenState, onExternalToggle, internalToggle],
  );
  const open = useMemo(
    () => (useExternalOpenState ? externalOpen : internalOpen),
    [useExternalOpenState, externalOpen, internalOpen],
  );
  const popupAnchor = useMemo(() => {
    if (children) {
      return (
        <button onClick={toggle} ref={anchorRef}>
          {children}
        </button>
      );
    }
    return (
      <button onClick={toggle} ref={anchorRef} className="tc__infoTooltip-icon">
        <InfoIcon />
      </button>
    );
  }, [children, toggle]);
  const popupContent = useMemo(() => {
    if (typeof content === 'string') {
      return <Typography className="tc__infoTooltip-popup-text" variant="tooltip-card-text" html={content} />;
    }
    return content;
  }, [content]);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div className="tc__infoTooltip">
      <div className={`tc__infoTooltip-anchor ${open ? 'tc__infoTooltip-active' : ''}`}>{popupAnchor}</div>
      <Popper
        className="tc__infoTooltip__popper"
        open={open}
        anchorEl={anchorRef.current}
        placement={placement}
        disablePortal
        modifiers={{
          arrow: {
            enabled: arrowEnabled,
            element: arrowRef.current,
          },
        }}
      >
        {arrowEnabled && <div className="tc__infoTooltip-arrow" ref={arrowRef}></div>}
        <div className="tc__infoTooltip-popup">{popupContent}</div>
      </Popper>
      {open && <div className="tc__backdrop" onClick={toggle} />}
    </div>
  );
};
export default InfoTooltip;
