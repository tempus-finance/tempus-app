import { render } from '@testing-library/react';
import Landing from './landing';

test('renders landing', () => {
  const { getByText } = render(<Landing />);

  expect(getByText(/Total Value Locked/i)).toBeInTheDocument();
});
