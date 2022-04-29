import { FC, HTMLProps, ReactNode, useCallback, useMemo, useState } from 'react';
import ButtonWrapper, { ButtonWrapperProps } from '../ButtonWrapper/ButtonWrapper';
import Tooltip, { TooltipPlacement } from '../Tooltip/Tooltip';

import './TooltipWrapper.scss';

export type OpenEvent = 'click' | 'mouseover';

export interface TooltipWrapperProps {
  tooltipContent: ReactNode;
  placement?: TooltipPlacement;
  openEvent?: OpenEvent;
  onOpen?: () => void;
  onClose?: () => void;
}

const TooltipWrapper: FC<TooltipWrapperProps> = props => {
  const { tooltipContent, placement, openEvent = 'click', onOpen, onClose, children } = props;

  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = useCallback(() => {
    setOpen(true);
    onOpen?.();
  }, [onOpen]);
  const handleClose = useCallback(() => {
    setOpen(false);
    onClose?.();
  }, [onClose]);
  const buttonProps = useMemo<ButtonWrapperProps>(() => {
    const obj: ButtonWrapperProps = {};
    switch (openEvent) {
      case 'click':
      default:
        obj.onClick = handleOpen;
        break;
      case 'mouseover':
        obj.onMouseOver = handleOpen;
        obj.onFocus = handleOpen;
        break;
    }

    return obj;
  }, [openEvent, handleOpen]);
  const backdropProps = useMemo<HTMLProps<HTMLDivElement>>(() => {
    const obj: HTMLProps<HTMLDivElement> = {};
    switch (openEvent) {
      case 'click':
      default:
        obj.onClick = handleClose;
        break;
      case 'mouseover':
        obj.onMouseOver = handleClose;
        obj.onFocus = handleClose;
        break;
    }

    return obj;
  }, [openEvent, handleClose]);

  if (!open) {
    return <ButtonWrapper {...buttonProps}>{children}</ButtonWrapper>;
  }

  return (
    <div className="tc__tooltip-wrapper">
      <div className="tc__tooltip-wrapper-backdrop" {...backdropProps} />
      <ButtonWrapper className="tc__tooltip-wrapper-anchor">{children}</ButtonWrapper>
      <Tooltip open placement={placement}>
        {tooltipContent}
      </Tooltip>
    </div>
  );
};

export default TooltipWrapper;
