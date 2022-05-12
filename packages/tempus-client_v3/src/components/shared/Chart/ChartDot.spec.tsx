import { render } from '@testing-library/react';
import ChartDot, { ChartDotProps } from './ChartDot';

const defaultProps: ChartDotProps = {
  centerX: 100,
  centerY: 100,
};

const subject = (props: ChartDotProps) => render(<ChartDot {...props} />);

describe('ChartDot', () => {
  ['plus', 'minus', 'tick', 'INVALID'].forEach(variant => {
    [false, true].forEach(selected => {
      it(`renders a ${selected ? '' : 'un'}selected ${variant} chart dot`, () => {
        const { container } = subject({ ...defaultProps, variant, selected });

        expect(container).not.toBeNull();
        expect(container).toMatchSnapshot();
      });
    });
  });
});
