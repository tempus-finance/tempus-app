import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PortfolioOverview from './PortfolioOverview';

const subject = () =>
  render(
    <BrowserRouter>
      <PortfolioOverview />
    </BrowserRouter>,
  );

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