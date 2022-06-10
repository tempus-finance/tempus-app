import { fireEvent, render, RenderResult } from '@testing-library/react';
import { createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';
import PortfolioNoPositions from './PortfolioNoPositions';

const subject = (): [RenderResult, History] => {
  const history = createMemoryHistory();
  history.push('/portfolio');

  const renderedSubject = render(
    <Router location={history.location} navigator={history}>
      <PortfolioNoPositions />
    </Router>,
  );

  return [renderedSubject, history];
};

describe('PortfolioNoPositions', () => {
  it('renders empty page when the user has no positions', () => {
    const [{ container }] = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('redirect when the user clicks on "Browse Markets" button', () => {
    const [{ getByRole }, history] = subject();
    const browseMarketsButton = getByRole('button');

    expect(browseMarketsButton).not.toBeNull();

    fireEvent.click(browseMarketsButton);

    expect(history.location.pathname).toBe('/');
  });
});
