import { FC, useCallback } from 'react';
import TickIcon from '../icons/TickIcon';
import InfoTooltip from '../infoTooltip/infoTooltip';
import Spacer from '../spacer/spacer';
import Typography from '../typography/Typography';

import './SectionContainer.scss';

interface SectionContainerProps {
  id?: string;
  title?: string;
  tooltip?: string;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  elevation?: number;
  onSelected?: (id: string | undefined) => void;
}

const SectionContainer: FC<SectionContainerProps> = props => {
  const { id, title, tooltip, selectable, selected, disabled, elevation = 1, onSelected } = props;

  const onClick = useCallback(() => {
    if (!disabled) {
      onSelected && onSelected(id);
    }
  }, [disabled, id, onSelected]);

  let contentClasses = 'tc__dialog__section-content';
  if (selected) {
    contentClasses += ' tc__dialog__section-content-selected';
  }
  if (selectable) {
    contentClasses += ' tc__dialog__section-content-selectable';
  }

  return (
    <div className={`tf__dialog__section-elevation-${elevation}`}>
      <div className="tf__dialog__section-title">
        {title && <Typography variant="card-title">{title}</Typography>}
        {title && <Spacer size={15} />}
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      {title && <Spacer size={15} />}
      <div className={contentClasses} onClick={onClick}>
        {props.children}
        {selected && (
          <div className="tf__dialog__section-tick">
            <TickIcon fillColor="#FF6B00" />
          </div>
        )}
      </div>
    </div>
  );
};
export default SectionContainer;
