import { FC } from 'react';
import './LoadingPlaceholder.scss';

export type LoadingPlaceholderWidth = 'tiny' | 'small' | 'medium' | 'large';
export type LoadingPlaceholderHeight = 'small' | 'medium';

export interface LoadingPlaceholderProps {
  width: LoadingPlaceholderWidth;
  height: LoadingPlaceholderHeight;
}

const LoadingPlaceholder: FC<LoadingPlaceholderProps> = props => {
  const { width, height } = props;

  return (
    <div
      // eslint-disable-next-line max-len
      className={`tc__loading-placeholder tc__loading-placeholder__width-${width} tc__loading-placeholder__height-${height}`}
    >
      <div className="tc__loading-placeholder__circle" />
      <div className="tc__loading-placeholder__bar" />
    </div>
  );
};

export default LoadingPlaceholder;
