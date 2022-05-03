import { fireEvent, render } from '@testing-library/react';
import InfoTooltip, { InfoTooltipProps } from './InfoTooltip';

const defaultProps: InfoTooltipProps = {
  tooltipContent: 'content',
};

const subject = (props: InfoTooltipProps) => render(<InfoTooltip {...props} />);

describe('InfoTooltip', () => {
  it('renders an info tooltip', () => {
    const { container } = subject(defaultProps);

    expect(container).not.toBeNull();

    expect(container).toMatchSnapshot();
  });

  it('renders an info tooltip, click to open to see string content', () => {
    const { container, getByRole, queryByText } = subject(defaultProps);

    const icon = getByRole('button');

    expect(container).not.toBeNull();
    expect(icon).not.toBeNull();

    fireEvent.click(icon);

    const content = queryByText(defaultProps.tooltipContent as string);

    expect(content).not.toBeNull();

    expect(content).toMatchSnapshot();
  });

  it('renders an info tooltip, click to open to see content', () => {
    const props = { ...defaultProps, tooltipContent: <div>content</div> };
    const { container, getByRole } = subject(props);

    const icon = getByRole('button');

    expect(container).not.toBeNull();
    expect(icon).not.toBeNull();

    fireEvent.click(icon);

    expect(container).toMatchSnapshot();
  });
});
