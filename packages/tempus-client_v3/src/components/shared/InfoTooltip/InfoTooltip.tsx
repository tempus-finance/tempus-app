import { FC, memo, ReactNode, useMemo } from 'react';
import Typography from '../Typography';
import TooltipWrapper, { OpenEvent } from '../TooltipWrapper/TooltipWrapper';
import { TooltipPlacement } from '../Tooltip/Tooltip';
import Icon, { IconVariant } from '../Icon';

import './InfoTooltip.scss';

export interface InfoTooltipProps {
  tooltipContent: ReactNode | string;
  iconVariant?: IconVariant;
  iconSize?: 'large' | 'medium' | 'small' | 'tiny' | number;
  iconColor?: string;
  openEvent?: OpenEvent;
  placement?: TooltipPlacement;
}

const InfoTooltip: FC<InfoTooltipProps> = props => {
  const {
    tooltipContent,
    iconVariant = 'info-bordered',
    iconSize,
    iconColor,
    placement = 'bottom-center',
    openEvent,
    children,
  } = props;

  const content: ReactNode = useMemo(() => {
    if (typeof tooltipContent === 'string') {
      return (
        <Typography className="tc__info-tooltip-content" variant="body-primary">
          {tooltipContent}
        </Typography>
      );
    }
    return tooltipContent;
  }, [tooltipContent]);
  const anchor = useMemo(
    () => children ?? <Icon variant={iconVariant} size={iconSize} color={iconColor} />,
    [children, iconVariant, iconSize, iconColor],
  );

  return (
    <TooltipWrapper tooltipContent={content} placement={placement} openEvent={openEvent}>
      {anchor}
    </TooltipWrapper>
  );
};

export default memo(InfoTooltip) as FC<InfoTooltipProps>;
