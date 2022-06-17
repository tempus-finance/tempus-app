import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { pool1 as mockPool1, pool2 as mockPool2 } from '../../setupTests';
import Portfolio from './Portfolio';

const subject = () =>
  render(
    <BrowserRouter>
      <Portfolio />
    </BrowserRouter>,
  );

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useUserDepositedPools: () => [mockPool1, mockPool2],
}));

describe('Portfolio', () => {
  it('renders portfolio page', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
