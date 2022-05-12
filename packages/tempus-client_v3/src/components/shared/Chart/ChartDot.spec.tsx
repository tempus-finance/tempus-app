import { render } from '@testing-library/react';
import ChartDot, { ChartDotProps } from './ChartDot';

const defaultProps: ChartDotProps = {
  centerX: 100,
  centerY: 100,
};

const subject = (props: ChartDotProps) => render(<ChartDot {...props} />);

describe('ChartDot', () => {
  let originalConsoleError: (...consoleData: any[]) => void = () => {};

  beforeEach(() => {
    // SVG tags (`path`, `circle`, etc.) are unrecognized in the testing browser, so ignore warnings
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

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
