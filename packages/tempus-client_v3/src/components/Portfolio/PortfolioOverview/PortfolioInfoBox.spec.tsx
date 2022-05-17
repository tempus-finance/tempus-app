import { render } from '@testing-library/react';
import PortfolioInfoBox, { PortfolioInfoBoxProps } from './PortfolioInfoBox';

const defaultProps: PortfolioInfoBoxProps = {
  title: 'Total Value',
  subtitle: 'of portfolio',
  value: '123.45',
};

const subject = (props: PortfolioInfoBoxProps) => render(<PortfolioInfoBox {...props} />);

describe('PortfolioInfoBox', () => {
  it('renders info box', () => {
    const { container } = subject(defaultProps);

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
