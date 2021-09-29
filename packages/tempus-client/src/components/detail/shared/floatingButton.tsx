import { FC } from 'react';

import './floatingButton.scss';

interface FloatingButtonProps {
  startOffset: number;
  onClick: () => void;
}

const FloatingButton: FC<FloatingButtonProps> = props => {
  const { startOffset, onClick } = props;

  return (
    <div className="tf__floating__button-container" style={{ paddingLeft: `${startOffset}px` }}>
      <div className="tf__floating__button" onClick={onClick}>
        {props.children}
      </div>
    </div>
  );
};
export default FloatingButton;
