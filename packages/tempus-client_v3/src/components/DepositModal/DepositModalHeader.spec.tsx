import { render } from '@testing-library/react';
import DepositModalHeader from './DepositModalHeader';

const subject = () => render(<DepositModalHeader />);

describe('DepositModalHeader', () => {
  it('renders a deposit modal header', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
