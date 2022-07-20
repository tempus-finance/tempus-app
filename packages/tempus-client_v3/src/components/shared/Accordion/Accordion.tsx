import { FC, memo, useCallback, useMemo, useState } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Icon, { IconVariant } from '../Icon';
import Loading from '../Loading';
import Typography from '../Typography';

import './Accordion.scss';

type AccordionIconVariant = IconVariant | 'pending';

export interface AccordionProps {
  iconVariant: AccordionIconVariant;
  iconColor?: string;
  title: string;
  defaultOpen?: boolean;
}

const Accordion: FC<AccordionProps> = props => {
  const { iconVariant, iconColor, title, children, defaultOpen } = props;

  const [open, setOpen] = useState<boolean>(defaultOpen || false);
  const handleToggle = useCallback(() => setOpen(state => !state), []);
  const icon = useMemo(
    () =>
      iconVariant === 'pending' ? (
        <Loading color="primary" size={16} />
      ) : (
        <Icon variant={iconVariant} color={iconColor} size="small" />
      ),
    [iconVariant, iconColor],
  );

  return (
    <div className="tc__accordion">
      <ButtonWrapper className="tc__accordion__title" onClick={handleToggle}>
        {icon}
        <Typography variant="body-secondary">{title}</Typography>
        <Icon variant={open ? 'up-chevron' : 'down-chevron'} size="small" />
      </ButtonWrapper>
      {open && <div className="tc__accordion__content">{children}</div>}
    </div>
  );
};

export default memo(Accordion) as FC<AccordionProps>;
