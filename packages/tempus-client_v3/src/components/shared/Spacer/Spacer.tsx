import { FC } from 'react';

interface SpacerProps {
  size: number;
}

const Spacer: FC<SpacerProps> = props => {
  return <div style={{ width: `${props.size}px`, height: `${props.size}px` }} />;
};

export default Spacer;
