import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Markets from './Markets';

const subject = () =>
  render(
    <BrowserRouter>
      <Markets />
    </BrowserRouter>,
  );

describe('Markets', () => {
  it('renders the page', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
