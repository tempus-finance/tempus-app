import { render } from '@testing-library/react';
import Spacer, { SpacerProps } from './Spacer';

const defaultProps: SpacerProps = {
  size: 16,
  variant: 'horizontal',
};

const subject = (props: SpacerProps) => render(<Spacer {...props} />);

describe('Spacer', () => {
  (['horizontal', 'vertical', 'box'] as ('horizontal' | 'vertical' | 'box')[]).forEach(variant => {
    it(`render a 16px spacer with variant ${variant}`, () => {
      const props = { ...defaultProps, variant, size: 16 };
      const { container } = subject(props);

      expect(container).not.toBeNull();
      expect(container).toMatchSnapshot();
    });

    it(`render a 32px spacer with variant ${variant}`, () => {
      const props = { ...defaultProps, variant, size: 32 };
      const { container } = subject(props);

      expect(container).not.toBeNull();
      expect(container).toMatchSnapshot();
    });
  });
});
