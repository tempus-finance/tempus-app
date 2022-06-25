import { fireEvent, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import PortfolioSubheader from './PortfolioSubheader';

const mockUseNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => mockUseNavigate,
}));

const history = createMemoryHistory();

const subject = () =>
  render(
    <Router location={history.location} navigator={history}>
      <PortfolioSubheader />
    </Router>,
  );

mockUseNavigate.mockImplementation(path => {
  history.push(path);
});

describe('PortfolioSubheader', () => {
  it('renders a navigation subheader portfolio tabs', () => {
    history.push('/portfolio/overview');

    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('updates tab selection when one of tabs is selected', () => {
    const { getByRole } = subject();

    const overviewButton = getByRole('button', { name: 'Overview' });
    const positionsButton = getByRole('button', { name: 'Positions' });

    expect(overviewButton).not.toBeNull();
    expect(positionsButton).not.toBeNull();

    fireEvent.click(positionsButton);

    expect(mockUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockUseNavigate).toHaveBeenCalledWith('/portfolio/positions');
  });
});
