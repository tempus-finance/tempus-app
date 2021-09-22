import { FC } from 'react';
import InfoTooltip from '../../infoTooltip/infoTooltip';
import Spacer from '../../spacer/spacer';
import Typography from '../../typography/Typography';

import './sectionContainer.scss';

interface SectionContainerProps {
  title?: string;
  tooltip?: string;
  selectable?: boolean;
  selected?: boolean;
}

const SectionContainer: FC<SectionContainerProps> = props => {
  const { title, tooltip, selectable, selected } = props;

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
      >
        {props.children}
      </div>
    </div>
  );
};
export default SectionContainer;
