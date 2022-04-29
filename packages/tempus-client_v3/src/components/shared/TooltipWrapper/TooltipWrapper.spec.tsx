import { fireEvent, render } from '@testing-library/react';
import Typography from '../Typography';
import TooltipWrapper, { OpenEvent, TooltipWrapperProps } from './TooltipWrapper';

const mockOnOpen = jest.fn();
const mockOnClose = jest.fn();

const tooltipText = 'Tooltip';
const anchorText = 'Anchor';

const defaultProps: TooltipWrapperProps = {
  tooltipContent: <Typography variant="body-primary">{tooltipText}</Typography>,
  onOpen: mockOnOpen,
  onClose: mockOnClose,
};

const subject = (props: TooltipWrapperProps) =>
  render(
    <TooltipWrapper {...props}>
      <Typography variant="body-primary">{anchorText}</Typography>
    </TooltipWrapper>,
  );

describe('TooltipWrapper', () => {
  it('render a simple TooltipWrapper', () => {
    const { container, getByRole, queryByText } = subject(defaultProps);

    const anchor = getByRole('button');
    const actualTooltipText = queryByText(tooltipText);
    const actualAnchorText = queryByText(anchorText);

    expect(container).not.toBeNull();
    expect(anchor).not.toBeNull();
    expect(actualTooltipText).toBeNull();
    expect(actualAnchorText).toHaveTextContent(anchorText);
    expect(mockOnOpen).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    expect(container).toMatchSnapshot();
  });

  it('render a simple TooltipWrapper, click to open tooltip', () => {
    const props = { ...defaultProps, openEvent: 'click' as OpenEvent };
    const { container, getByRole, queryByText } = subject(props);

    const anchor = getByRole('button');

    expect(container).not.toBeNull();
    expect(anchor).not.toBeNull();
    expect(mockOnOpen).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    fireEvent.click(anchor);

    const actualTooltipText = queryByText(tooltipText);
    const actualAnchorText = queryByText(anchorText);

    expect(actualTooltipText).toHaveTextContent(tooltipText);
    expect(actualAnchorText).toHaveTextContent(anchorText);
    expect(mockOnOpen).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    expect(container).toMatchSnapshot();
  });

  it('render a simple TooltipWrapper, click to open tooltip, click backdrop to close', () => {
    const props = { ...defaultProps, openEvent: 'click' as OpenEvent };
    const { container, getByRole, queryByText } = subject(props);

    const anchor = getByRole('button');

    expect(container).not.toBeNull();
    expect(anchor).not.toBeNull();
    expect(mockOnOpen).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    fireEvent.click(anchor);

    const actualTooltipText1 = queryByText(tooltipText);
    const actualAnchorText1 = queryByText(anchorText);
    const backdrop = container.querySelector('.tc__tooltip-wrapper-backdrop');

    expect(actualTooltipText1).toHaveTextContent(tooltipText);
    expect(actualAnchorText1).toHaveTextContent(anchorText);
    expect(backdrop).not.toBeNull();
    expect(mockOnOpen).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(0);

    fireEvent.click(backdrop as Element);

    const actualTooltipText2 = queryByText(tooltipText);
    const actualAnchorText2 = queryByText(anchorText);

    expect(actualTooltipText2).toBeNull();
    expect(actualAnchorText2).toHaveTextContent(anchorText);
    expect(mockOnOpen).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    expect(container).toMatchSnapshot();
  });

  it('render a simple TooltipWrapper, mouseover to open tooltip', () => {
    const props = { ...defaultProps, openEvent: 'mouseover' as OpenEvent };
    const { container, getByRole, queryByText } = subject(props);

    const anchor = getByRole('button');

    expect(container).not.toBeNull();
    expect(anchor).not.toBeNull();
    expect(mockOnOpen).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    fireEvent.mouseOver(anchor);

    const actualTooltipText = queryByText(tooltipText);
    const actualAnchorText = queryByText(anchorText);

    expect(actualTooltipText).toHaveTextContent(tooltipText);
    expect(actualAnchorText).toHaveTextContent(anchorText);
    expect(mockOnOpen).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    expect(container).toMatchSnapshot();
  });

  it('render a simple TooltipWrapper, mouseover to open tooltip, mpuseout to close', () => {
    const props = { ...defaultProps, openEvent: 'mouseover' as OpenEvent };
    const { container, getByRole, queryByText } = subject(props);

    const anchor = getByRole('button');

    expect(container).not.toBeNull();
    expect(anchor).not.toBeNull();
    expect(mockOnOpen).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();

    fireEvent.mouseOver(anchor);

    const actualTooltipText1 = queryByText(tooltipText);
    const actualAnchorText1 = queryByText(anchorText);
    const backdrop = container.querySelector('.tc__tooltip-wrapper-backdrop');

    expect(actualTooltipText1).toHaveTextContent(tooltipText);
    expect(actualAnchorText1).toHaveTextContent(anchorText);
    expect(backdrop).not.toBeNull();
    expect(mockOnOpen).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(0);

    fireEvent.mouseOver(backdrop as Element);

    const actualTooltipText2 = queryByText(tooltipText);
    const actualAnchorText2 = queryByText(anchorText);

    expect(actualTooltipText2).toBeNull();
    expect(actualAnchorText2).toHaveTextContent(anchorText);
    expect(mockOnOpen).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    expect(container).toMatchSnapshot();
  });
});
