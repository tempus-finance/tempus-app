import { render } from '@testing-library/react';
import Dropdown, { DropdownProps } from './Dropdown';

const defaultProps: DropdownProps = {
  label: 'Filter',
  popupTitle: 'Title',
};

const subject = (props: DropdownProps) => render(<Dropdown {...props}></Dropdown>);

describe('Dropdown', () => {
  it('renders a button element', () => {
    const { getByRole } = subject(defaultProps);

    const result = getByRole('button');

    expect(result).not.toBeNull();
    expect(result).toMatchSnapshot();
  });

  it('renders a button with provided label', () => {
    const { getByText } = subject(defaultProps);

    const result = getByText(defaultProps.label);

    expect(result).not.toBeNull();
    expect(result).toMatchSnapshot();
  });
});
