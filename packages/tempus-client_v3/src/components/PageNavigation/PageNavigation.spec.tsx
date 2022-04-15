import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PageNavigation, { PageNavigationProps } from './PageNavigation';

const defaultProps: PageNavigationProps = {
  navigationLinks: [
    { text: 'Link 1', path: '/' },
    { text: 'Link 2', path: '/link2' },
  ],
};

const subject = (props: PageNavigationProps & { location: string }) => {
  window.history.pushState({}, 'Link 1', props.location);

  return render(
    <BrowserRouter>
      <PageNavigation {...props} />
    </BrowserRouter>,
  );
};

describe('PageNavigation', () => {
  it('renders a page navigation component with first tab selected', () => {
    const { container, getByRole } = subject({ ...defaultProps, location: '/' });

    const actualPageNavigation = container.querySelector('.tc__page-navigation');

    const firstTab = getByRole('link', { name: /Link 1/ });
    const secondTab = getByRole('link', { name: /Link 2/ });

    expect(firstTab).not.toBeNull();
    expect(secondTab).not.toBeNull();

    expect(actualPageNavigation).toMatchSnapshot();
  });

  it('renders a page navigation component with second tab selected', () => {
    const { container, getByRole } = subject({ ...defaultProps, location: '/link2' });

    const actualPageNavigation = container.querySelector('.tc__page-navigation');

    const firstTab = getByRole('link', { name: /Link 1/ });
    const secondTab = getByRole('link', { name: /Link 2/ });

    expect(firstTab).not.toBeNull();
    expect(secondTab).not.toBeNull();

    expect(actualPageNavigation).toMatchSnapshot();
  });

  it('navigates to a path when the corresponding tab is clicked', () => {
    const { container, getByRole } = subject({ ...defaultProps, location: '/' });

    const firstTab = getByRole('link', { name: /Link 1/ });
    const secondTab = getByRole('link', { name: /Link 2/ });

    expect(firstTab).not.toBeNull();
    expect(secondTab).not.toBeNull();

    expect(window.location.pathname).toBe('/');

    fireEvent.click(secondTab);

    expect(window.location.pathname).toBe('/link2');

    const actualPageNavigation = container.querySelector('.tc__page-navigation');
    expect(actualPageNavigation).toMatchSnapshot();
  });
});
