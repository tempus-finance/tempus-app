import { render } from '@testing-library/react';
import PoolsHeading, { PoolsHeadingProps } from './PoolsHeading';

const defaultProps: PoolsHeadingProps = {
  text: 'Ethereum-network pools',
};

const subject = (props: PoolsHeadingProps) => render(<PoolsHeading {...props} />);

describe('PoolsHeading', () => {
  it('renders a heading label with provided text', () => {
    const { container, getByText } = subject(defaultProps);

    const actualText = getByText('Ethereum-network pools');

    expect(actualText).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
