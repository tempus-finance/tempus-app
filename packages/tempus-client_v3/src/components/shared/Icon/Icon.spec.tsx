import { render } from '@testing-library/react';
import Icon, { IconProps, IconType } from './Icon';

const defaultProps: IconProps = {
  size: 'medium',
  color: '#222222',
};

const subject = (props: IconProps & { type: IconType }) => render(<Icon {...props} />);

describe('Icon', () => {
  [
    'plus-round',
    'checkmark-round',
    'minus-round',
    'cross-round',
    'up-chevron',
    'right-chevron',
    'left-chevron',
    'down-chevron',
    'up-arrow',
    'right-arrow',
    'left-arrow',
    'down-arrow',
    'up-arrow-thin',
    'right-arrow-thin',
    'left-arrow-thin',
    'down-arrow-thin',
    'list-view',
    'grid-view',
    'plus',
    'minus',
    'menu',
    'close',
    'info',
    'info-bordered',
    'info-solid',
    'exclamation',
    'exclamation-bordered',
    'exclamation-neutral',
    'exclamation-error',
    'checkmark',
    'checkmark-bordered',
    'checkmark-solid',
    'external',
    'twitter',
    'discord',
    'medium',
    'github',
    'telegram',
    'scroll',
    'slippage',
    'globe',
    'dark',
  ].forEach(type =>
    it(`renders an icon with type ${type}`, () => {
      const { container } = subject({ ...defaultProps, type: type as IconType });
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull;
      expect(svg).toHaveClass('tc__icon');
      expect(svg).toHaveClass(`tc__icon-${type}`);
      expect(svg).toMatchSnapshot();
    }),
  );
});