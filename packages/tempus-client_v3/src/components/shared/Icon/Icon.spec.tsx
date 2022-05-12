import { render } from '@testing-library/react';
import Icon, { IconVariant } from './Icon';
import IconProps from './IconProps';

const defaultProps: IconProps = {
  color: '#222222',
};

const subject = (props: IconProps & { variant: IconVariant }) => render(<Icon {...props} />);

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
  ].forEach(variant => {
    it(`renders an icon with type ${variant}`, () => {
      const { container } = subject({ ...defaultProps, variant: variant as IconVariant });
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull();
      expect(svg).toHaveClass('tc__icon');
      expect(svg).toHaveClass(`tc__icon-${variant}`);
      expect(svg).toMatchSnapshot();
    });

    it(`renders an tiny icon with type ${variant}`, () => {
      const { container } = subject({ ...defaultProps, size: 'tiny', variant: variant as IconVariant });
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull();
      expect(svg).toHaveClass('tc__icon');
      expect(svg).toHaveClass(`tc__icon-${variant}`);
      expect(svg).toMatchSnapshot();
    });

    it(`renders an small icon with type ${variant}`, () => {
      const { container } = subject({ ...defaultProps, size: 'small', variant: variant as IconVariant });
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull();
      expect(svg).toHaveClass('tc__icon');
      expect(svg).toHaveClass(`tc__icon-${variant}`);
      expect(svg).toMatchSnapshot();
    });

    it(`renders an medium icon with type ${variant}`, () => {
      const { container } = subject({ ...defaultProps, size: 'medium', variant: variant as IconVariant });
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull();
      expect(svg).toHaveClass('tc__icon');
      expect(svg).toHaveClass(`tc__icon-${variant}`);
      expect(svg).toMatchSnapshot();
    });

    it(`renders an large icon with type ${variant}`, () => {
      const { container } = subject({ ...defaultProps, size: 'large', variant: variant as IconVariant });
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull();
      expect(svg).toHaveClass('tc__icon');
      expect(svg).toHaveClass(`tc__icon-${variant}`);
      expect(svg).toMatchSnapshot();
    });
  });

  it('renders an icon with unsupported type', () => {
    const { container } = subject({ ...defaultProps, variant: 'UNSUPPORTED' as IconVariant });
    const svg = container.querySelector('svg');

    expect(svg).toBeNull();
  });
});
