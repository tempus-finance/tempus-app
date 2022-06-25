import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { pool1 as mockPool1, pool2 as mockPool2 } from '../../setupTests';
import Portfolio from './Portfolio';

const history = createMemoryHistory();

const subject = () =>
  render(
    <Router location={history.location} navigator={history}>
      <Portfolio />
    </Router>,
  );

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useUserDepositedPools: () => [mockPool1, mockPool2],
}));

describe('Portfolio', () => {
  it('renders portfolio page', () => {
    history.push('/portfolio/overview');

    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
