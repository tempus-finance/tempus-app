import { FC } from 'react';
import TickIcon from '../../icons/TickIcon';
import InfoTooltip from '../../infoTooltip/infoTooltip';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';

import './sectionContainer.scss';

interface SectionContainerProps {
  id?: string;
  title?: string;
  tooltip?: string;
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onSelected?: (id: string | undefined) => void;
}

const SectionContainer: FC<SectionContainerProps> = props => {
  const { id, title, tooltip, selectable, selected, disabled, onSelected } = props;

  const onClick = () => {
    if (!disabled) {
      onSelected && onSelected(id);
    }
  };

  return (
    <div className="tf__dialog__section-container">
      {title && tooltip && <Spacer size={18} />}
      <div className="tf__dialog__section-title">
        {title && <Typography variant="h4">{title}</Typography>}
        {title && <Spacer size={10} />}
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      {title && <Spacer size={18} />}
      <div
        className="tf__dialog__section-content"
        style={{
          border: selected ? '1px solid #F24C00' : '1px solid transparent',
          cursor: selectable ? 'pointer' : 'default',
        }}
        onClick={onClick}
      >
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
