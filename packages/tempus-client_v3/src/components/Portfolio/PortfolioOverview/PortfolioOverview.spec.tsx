import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { pool1 as mockPool1, pool2 as mockPool2 } from '../../../setupTests';
import PortfolioOverview from './PortfolioOverview';

const subject = () =>
  render(
    <BrowserRouter>
      <PortfolioOverview />
    </BrowserRouter>,
  );

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useUserDepositedPools: () => [mockPool1, mockPool2],
}));

describe('PortfolioOverview', () => {
  it('renders portfolio overview with yield chart', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders portfolio overview with value chart', () => {
    const { container } = subject();

    const chartTabs = container.querySelectorAll('.tc__tabs__tab');

    expect(chartTabs).toHaveLength(2);

    fireEvent.click(chartTabs[1]);

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
