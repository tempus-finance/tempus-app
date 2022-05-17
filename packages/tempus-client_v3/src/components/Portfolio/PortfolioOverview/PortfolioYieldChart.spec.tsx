import { render } from '@testing-library/react';
import PortfolioYieldChart from './PortfolioYieldChart';

const subject = () => render(<PortfolioYieldChart width={800} />);

describe('PortfolioYieldChart', () => {
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    // `render` doesn't properly handle percentage values for chart's width/height, so ignore warnings
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  it('renders portfolio yield chart', () => {
    const originalDateNow = Date.now;
    Date.now = () => new Date(2022, 4, 15).getTime();

    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();

    Date.now = originalDateNow;
  });
});
