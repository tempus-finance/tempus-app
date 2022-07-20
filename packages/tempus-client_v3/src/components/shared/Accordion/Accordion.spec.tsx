import { fireEvent, render } from '@testing-library/react';
import Accordion, { AccordionProps } from './Accordion';
import { colors } from '../Colors';

const defaultProps: AccordionProps = {
  iconVariant: 'checkmark',
  iconColor: colors.textSuccess,
  title: 'Success transaction',
  defaultOpen: false,
};

const CONTENT = 'This is the content';
const subject = (props: AccordionProps) => render(<Accordion {...props}>{CONTENT}</Accordion>);

describe('Accordion', () => {
  it('renders an accordion element', () => {
    const { container, getByRole, queryByText } = subject(defaultProps);

    const button = getByRole('button');
    const content = queryByText(CONTENT);

    expect(button).not.toBeNull();
    expect(content).toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders an accordion element with subtitle', () => {
    const props: AccordionProps = { ...defaultProps, subtitle: 'subtitle' };
    const { container, getByRole, queryByText } = subject(props);

    const button = getByRole('button');
    const content = queryByText(CONTENT);

    expect(button).not.toBeNull();
    expect(content).toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders an accordion element which default to open', () => {
    const props = { ...defaultProps, defaultOpen: true };
    const { container, getByRole, queryByText } = subject(props);

    const button = getByRole('button');
    const content = queryByText(CONTENT);

    expect(button).not.toBeNull();
    expect(content).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('renders an accordion element with loading spinner', () => {
    const props: AccordionProps = { ...defaultProps, iconVariant: 'pending' };
    const { container, getByRole, queryByText } = subject(props);

    const button = getByRole('button');
    const content = queryByText(CONTENT);

    expect(button).not.toBeNull();
    expect(content).toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('click the accordion title to toggle open and close', () => {
    const { getByRole, queryByText } = subject(defaultProps);

    const button = getByRole('button');
    const content1 = queryByText(CONTENT);

    expect(button).not.toBeNull();
    expect(content1).toBeNull();

    fireEvent.click(button);

    const content2 = queryByText(CONTENT);

    expect(content2).not.toBeNull();

    fireEvent.click(button);

    const content3 = queryByText(CONTENT);

    expect(content3).toBeNull();
  });
});
