import { FC } from 'react';
import PlusIcon from '../icons/PlusIcon';

import './PlusIconContainer.scss';

interface PlusIconContainerProps {
  orientation: 'vertical' | 'horizontal';
}

const PlusIconContainer: FC<PlusIconContainerProps> = props => {
  const { orientation } = props;

  return (
    <div
      className="tf__plus__icon__container"
      style={{
        height: orientation === 'horizontal' ? '5px' : '100%',
        width: orientation === 'horizontal' ? '100%' : '5px',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      }}
    >
      <PlusIcon />
    </div>
  );
};
export default PlusIconContainer;
