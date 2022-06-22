import { render } from '@testing-library/react';
import { pool1 as mockPool1, pool2 as mockPool2 } from '../../../setupTests';
import PortfolioYieldChart from './PortfolioYieldChart';

const subject = () => render(<PortfolioYieldChart width={800} />);

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useUserDepositedPools: jest.fn().mockReturnValue([mockPool1, mockPool2]),
}));

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
    jest.spyOn(Date, 'now').mockReturnValue(new Date(2022, 4, 15).getTime());

    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
