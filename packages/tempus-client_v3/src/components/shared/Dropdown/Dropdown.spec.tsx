import { fireEvent, render } from '@testing-library/react';
import Dropdown, { DropdownProps } from './Dropdown';

const defaultProps: DropdownProps = {
  label: 'Filter',
  popupTitle: 'Title',
};

const subject = (props: DropdownProps) => render(<Dropdown {...props} />);

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

  it('renders a down-chevron inside dropdown', () => {
    const { container } = subject(defaultProps);
    const iconSvg = container.querySelector('svg');

    expect(iconSvg).not.toBeNull();
    expect(iconSvg).toHaveClass('tc__icon-down-chevron');
    expect(iconSvg).toMatchSnapshot();
  });

  it('opens a popup when clicked', () => {
    const { getByRole, container } = subject(defaultProps);

    const button = getByRole('button');
    fireEvent.click(button);

    const popupElements = container.getElementsByClassName('tc__dropdown__popup');

    expect(popupElements.length).toBe(1);
    expect(popupElements).toMatchSnapshot();
  });

  it('closes when clicked on while open', () => {
    const { getByRole, container } = subject(defaultProps);

    const button = getByRole('button');
    fireEvent.click(button); // open
    fireEvent.click(button); // close

    const popupElements = container.getElementsByClassName('tc__dropdown__popup');

    expect(popupElements.length).toBe(0);
    expect(popupElements).toMatchSnapshot();
  });

  it('does not close when clicked on the list', () => {
    const { getByRole, container } = subject(defaultProps);

    const button = getByRole('button');
    fireEvent.click(button);

    const popupElements = container.getElementsByClassName('tc__dropdown__popup');
    fireEvent.click(popupElements[0]);

    expect(popupElements.length).toBe(1);
    expect(popupElements).toMatchSnapshot();
  });

  it('renders up-chevron when open', () => {
    const { getByRole, container } = subject(defaultProps);

    const button = getByRole('button');
    fireEvent.click(button);

    const iconSvg = container.querySelector('svg');

    expect(iconSvg).not.toBeNull();
    expect(iconSvg).toHaveClass('tc__icon-up-chevron');
    expect(iconSvg).toMatchSnapshot();
  });

  it('renders a popup title', () => {
    const label = 'Dropdown label';
    const popupTitle = 'Dropdown popup label';

    const { getByRole, getByText } = subject({
      label,
      popupTitle,
    });

    const button = getByRole('button');
    fireEvent.click(button);

    const result = getByText(popupTitle);

    expect(result).not.toBeNull();
    expect(result).toMatchSnapshot();
  });
});
