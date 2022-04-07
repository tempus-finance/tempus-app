import { fireEvent, render } from '@testing-library/react';
import ActionButton, { ButtonProps } from './ActionButton';

const mockOnClick = jest.fn();

const defaultProps: ButtonProps = {
  labels: { default: 'Default', loading: 'Loading', success: 'Success' },
  onClick: mockOnClick,
};

const subject = (props: ButtonProps) => render(<ActionButton {...props} />);

describe('ActionButton', () => {
  it('renders a button with a `default` label', () => {
    const { queryByText, getByRole } = subject(defaultProps);

    const actualButton = getByRole('button');
    const actualText = queryByText('Default');

    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
  });

  it('renders a button with a `loading` label', () => {
    const { queryByText, getByRole } = subject({ ...defaultProps, state: 'loading' });

    const actualButton = getByRole('button');
    const actualText = queryByText('Loading');

    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
  });

  it('renders a button with a `success` label', () => {
    const { queryByText, getByRole } = subject({ ...defaultProps, state: 'success' });

    const actualButton = getByRole('button');
    const actualText = queryByText('Success');

    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
  });

  it('renders a button with a `disabled` state', () => {
    const { queryByText, getByRole } = subject({ ...defaultProps, state: 'disabled' });

    const actualButton = getByRole('button');
    const actualText = queryByText('Default');

    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
  });

  it('renders a secondary button with a `default` label', () => {
    const { queryByText, getByRole } = subject({ ...defaultProps, variant: 'secondary', fullWidth: true });

    const actualButton = getByRole('button');
    const actualText = queryByText('Default');

    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
  });

  it('renders a secondary button with a `loading` label', () => {
    const { queryByText, getByRole } = subject({ ...defaultProps, state: 'loading', variant: 'secondary' });

    const actualButton = getByRole('button');
    const actualText = queryByText('Loading');

    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
  });

  it('renders a secondary button with a `success` label', () => {
    const { queryByText, getByRole } = subject({
      ...defaultProps,
      state: 'success',
      variant: 'secondary',
      size: 'large',
    });

    const actualButton = getByRole('button');
    const actualText = queryByText('Success');

    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
  });

  it('renders a secondary button with a `disabled` state', () => {
    const { queryByText, getByRole } = subject({ ...defaultProps, state: 'disabled', variant: 'secondary' });

    const actualButton = getByRole('button');
    const actualText = queryByText('Default');

    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
  });

  it('renders a tertiary button with a `loading` state', () => {
    const { queryByText, getByRole } = subject({
      ...defaultProps,
      state: 'loading',
      variant: 'tertiary',
      size: 'large',
    });

    const actualButton = getByRole('button');
    const actualText = queryByText('Loading');

    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
  });

  it('renders a tertiary button with a `disabled` state', () => {
    const { queryByText, getByRole } = subject({ ...defaultProps, state: 'disabled', variant: 'tertiary' });

    const actualButton = getByRole('button');
    const actualText = queryByText('Default');

    expect(actualText).not.toBeNull();

    expect(actualButton).toMatchSnapshot();
  });

  it('calls `onClick` when the button is clicked', () => {
    const { getByRole } = subject(defaultProps);

    const button = getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
