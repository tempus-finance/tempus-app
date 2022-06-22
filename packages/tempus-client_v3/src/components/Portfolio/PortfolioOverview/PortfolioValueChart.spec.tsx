import { render } from '@testing-library/react';
import { pool1 as mockPool1, pool2 as mockPool2 } from '../../../setupTests';
import PortfolioValueChart from './PortfolioValueChart';

const subject = () => render(<PortfolioValueChart width={800} />);

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useUserDepositedPools: jest.fn().mockReturnValue([mockPool1, mockPool2]),
}));

describe('PortfolioValueChart', () => {
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    // `render` doesn't properly handle percentage values for chart's width/height, so ignore warnings
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
  });

  it('renders portfolio value chart', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
