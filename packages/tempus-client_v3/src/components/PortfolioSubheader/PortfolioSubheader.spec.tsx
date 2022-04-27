import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PortfolioSubheader, { PortfolioSubheaderProps, PortfolioView } from './PortfolioSubheader';

const onViewChangeMock = jest.fn<void, [PortfolioView]>();

const subject = (props: PortfolioSubheaderProps) =>
  render(
    <BrowserRouter>
      <PortfolioSubheader {...props} />
    </BrowserRouter>,
  );

describe('PortfolioSubheader', () => {
  it('renders a navigation subheader portfolio tabs', () => {
    const { container } = subject({});

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('updates tab selection when one of tabs is selected', () => {
    const { getByRole } = subject({ onViewChange: onViewChangeMock });

    const overviewButton = getByRole('button', { name: 'Overview' });
    const positionsButton = getByRole('button', { name: 'Positions' });

    expect(overviewButton).not.toBeNull();
    expect(positionsButton).not.toBeNull();

    fireEvent.click(positionsButton);

    expect(onViewChangeMock).toBeCalledTimes(1);
    expect(onViewChangeMock).toBeCalledWith('positions');

    expect(overviewButton).toMatchSnapshot();
    expect(positionsButton).toMatchSnapshot();
  });
});
