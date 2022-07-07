import { FC, memo } from 'react';
import { AnimationOnScroll } from 'react-animation-on-scroll';

type FadingBlockVariant = 'background1' | 'background2' | 'background3' | 'background4' | 'background5' | 'background6';
type MovingDirection = 'left' | 'right';

interface FadingBlockProps {
  variant: FadingBlockVariant;
  align: MovingDirection;
  offsetX: number;
  offsetY: number;
}

const FadingBlock: FC<FadingBlockProps> = props => {
  const { variant, align, offsetX, offsetY } = props;

  const style: any = { [align]: offsetX, top: offsetY };

  switch (variant) {
    case 'background1':
    case 'background4':
      style.width = 604;
      style.height = 631;
      break;
    case 'background2':
    case 'background5':
      style.width = 702;
      style.height = 621;
      break;
    case 'background3':
    case 'background6':
      style.width = 660;
      style.height = 599;
      break;
    default:
  }

  return (
    <AnimationOnScroll
      className={`tw__team__fading-block ${variant}`}
      animateIn={`tw__team__fading-block-${align}-in`}
      animateOut={`tw__team__fading-block-${align}-out`}
      delay={0.5}
      style={style}
    />
  );
};

export default memo(FadingBlock);
