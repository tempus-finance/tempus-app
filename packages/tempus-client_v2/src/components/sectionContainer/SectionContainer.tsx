import { FC, memo, ReactNode, useCallback, useContext } from 'react';
import { LocaleContext } from '../../context/localeContext';
import getText from '../../localisation/getText';
import Words from '../../localisation/words';
import InfoTooltip from '../infoTooltip/infoTooltip';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';

import './SectionContainer.scss';

interface SectionContainerProps {
  id?: string;
  title?: Words | ReactNode;
  tooltip?: string;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  elevation?: number;
  onSelected?: (id: string) => void;
  children?: ReactNode;
}

const SectionContainer: FC<SectionContainerProps> = props => {
  const { id, title, tooltip, selectable, selected, disabled, elevation = 1, onSelected } = props;

  const { locale } = useContext(LocaleContext);

  const onClick = useCallback(() => {
    if (!disabled && id) {
      onSelected && onSelected(id);
    }
  }, [disabled, id, onSelected]);

  let contentClasses = 'tc__dialog__section-content';
  if (selectable) {
    contentClasses += ' tc__dialog__section-content-selectable';
  }

  let rootClasses = `tf__dialog__section tf__dialog__section-elevation-${elevation}`;
  if (selected) {
    rootClasses += ' tc__dialog__section-selected';
  }

  let titleNode = title;
  if (typeof title === 'string') {
    titleNode = (
      <>
        <Typography variant="card-title">{getText(title as Words, locale)}</Typography>
        <Spacer size={15} />
        {tooltip && <InfoTooltip content={tooltip} />}
      </>
    );
  }

  return (
    <div className={rootClasses}>
      <div className="tf__dialog__section-title">{titleNode}</div>
      {title && <Spacer size={15} />}
      <div className={contentClasses} onClick={onClick}>
        {props.children}
      </div>
    </div>
  );
};
export default memo(SectionContainer);
