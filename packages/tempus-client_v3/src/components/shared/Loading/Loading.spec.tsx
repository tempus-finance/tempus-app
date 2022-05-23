import { render } from '@testing-library/react';
import Loading, { LoadingColor, LoadingProps } from './Loading';

const subject = (props: LoadingProps) => render(<Loading {...props} />);

describe('Loading', () => {
  it('renders a loading', () => {
    const { container } = subject({});

    const svg = container.querySelector('svg');
    const loadingCircle = container.querySelector('circle');

    expect(loadingCircle).not.toBeNull();
    expect(loadingCircle).toHaveClass('tc__loading');

    expect(svg).not.toBeNull();
    expect(svg).toMatchSnapshot();
  });

  (['default', 'secondary'] as LoadingColor[]).forEach(color => {
    it(`renders a default-sized loading with ${color} color`, () => {
      const { container } = subject({ color });

      const svg = container.querySelector('svg');
      const loadingCircle = container.querySelector('circle');

      expect(loadingCircle).not.toBeNull();
      expect(loadingCircle).toHaveClass('tc__loading');
      expect(loadingCircle).toHaveClass(`tc__loading__color-bg-${color}`);

      expect(svg).not.toBeNull();
      expect(svg).toMatchSnapshot();
    });

    it(`renders a loading with ${color} color and size of 16 pixels`, () => {
      const { container } = subject({ size: 16, color });

      const svg = container.querySelector('svg');
      const loadingCircle = container.querySelector('circle');

      expect(loadingCircle).not.toBeNull();
      expect(loadingCircle).toHaveClass('tc__loading');
      expect(loadingCircle).toHaveClass(`tc__loading__color-bg-${color}`);

      expect(svg).not.toBeNull();
      expect(svg).toMatchSnapshot();
    });
  });
});
