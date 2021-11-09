import { FC, useCallback, useContext } from 'react';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Words from '../../localisation/words';
import InfoTooltip from '../infoTooltip/infoTooltip';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';

import './SectionContainer.scss';

interface SectionContainerProps {
  id?: string;
  title?: Words;
  tooltip?: string;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  elevation?: number;
  onSelected?: (id: string) => void;
}

const SectionContainer: FC<SectionContainerProps> = props => {
  const { id, title, tooltip, selectable, selected, disabled, elevation = 1, onSelected } = props;

  const { language } = useContext(LanguageContext);

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

  return (
    <div className={rootClasses}>
      <div className="tf__dialog__section-title">
        {title && <Typography variant="card-title">{getText(title, language)}</Typography>}
        {title && <Spacer size={15} />}
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      {title && <Spacer size={15} />}
      <div className={contentClasses} onClick={onClick}>
        {props.children}
      </div>
    </div>
  );
};
export default SectionContainer;
