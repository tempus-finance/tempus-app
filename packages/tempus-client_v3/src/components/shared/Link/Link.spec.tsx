import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Link, { LinkProps } from './Link';

const mockOnClick = jest.fn();

const defaultProps: LinkProps = {
  onClick: mockOnClick,
};

const subject = (props: LinkProps) =>
  render(
    <BrowserRouter>
      <Link {...props}>Link</Link>
    </BrowserRouter>,
  );

describe('Link', () => {
  it('renders a link to google', () => {
    const props = {
      ...defaultProps,
      className: 'tc__external-link',
      title: 'link to google',
      href: 'https://www.google.com',
    };
    const { getByRole } = subject(props);

    const link = getByRole('link');

    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('title', props.title);
    expect(link).toHaveAttribute('href', props.href);
    expect(link.getAttribute('class')).toContain(props.className);

    expect(link).toMatchSnapshot();
  });

  it('renders a link to internal site', () => {
    const props = {
      ...defaultProps,
      className: 'tc__internal-link',
      title: 'link to team page',
      href: '/team',
    };
    const { getByRole } = subject(props);

    const link = getByRole('link');

    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('title', props.title);
    expect(link).toHaveAttribute('href', props.href);
    expect(link.getAttribute('class')).toContain(props.className);

    expect(link).toMatchSnapshot();
  });

  it('renders an empty link', () => {
    const { getByRole } = subject(defaultProps);

    const link = getByRole('link');

    expect(link).not.toBeNull();
    expect(link).not.toHaveAttribute('title');
    expect(link).toHaveAttribute('href', '/');

    expect(link).toMatchSnapshot();
  });
});
