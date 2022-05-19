import { fireEvent, render } from '@testing-library/react';
import { FC, useState } from 'react';
import { IconVariant } from '../Icon';
import IconButtonGroup, { IconButtonGroupProps } from './IconButtonGroup';

const mockOnChange = jest.fn();

const defaultProps: IconButtonGroupProps = {
  variants: ['grid-view', 'list-view'],
  onChange: mockOnChange,
};

const Wrapper: FC<IconButtonGroupProps> = props => {
  const [selectedVariant, setSelectedVariant] = useState<IconVariant>(props.selectedVariant ?? props.variants[0]);
  mockOnChange.mockImplementation((val: IconVariant) => setSelectedVariant(val));
  return <IconButtonGroup {...props} selectedVariant={selectedVariant} />;
};

const subject = (props: IconButtonGroupProps) => render(<Wrapper {...props} />);

describe('IconButtonGroup', () => {
  it('renders a group of icon buttons', () => {
    const { container } = subject(defaultProps);

    const actualIconButtonGroup = container.querySelector('.tc__iconButtonGroup');

    expect(actualIconButtonGroup).not.toBeNull();

    expect(actualIconButtonGroup).toMatchSnapshot();
  });

  it('calls `onClick` when an icon button is clicked', () => {
    const { container, getAllByRole } = subject(defaultProps);

    const actualIconButtonGroup = container.querySelector('.tc__iconButtonGroup');

    expect(actualIconButtonGroup).not.toBeNull();

    const [firstButton, secondButton] = getAllByRole('button');

    fireEvent.click(secondButton);
    expect(mockOnChange).toHaveBeenCalledWith('list-view');

    fireEvent.click(firstButton);
    expect(mockOnChange).toHaveBeenCalledWith('grid-view');

    expect(mockOnChange).toHaveBeenCalledTimes(2);

    expect(actualIconButtonGroup).toMatchSnapshot();
  });
});
