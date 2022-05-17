import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Portfolio from './Portfolio';

const subject = () =>
  render(
    <BrowserRouter>
      <Portfolio />
    </BrowserRouter>,
  );

describe('Portfolio', () => {
  it('renders portfolio page', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
