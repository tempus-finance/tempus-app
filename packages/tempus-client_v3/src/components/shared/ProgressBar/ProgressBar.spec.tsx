import { render } from '@testing-library/react';
import ProgressBar, { ProgressBarProps } from './ProgressBar';

const subject = (props: ProgressBarProps) => render(<ProgressBar {...props} />);

describe('ProgressBar', () => {
  it('renders a progress bar', () => {
    const { container } = subject({ value: 42 });

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });
});
