import { render } from '@testing-library/react';
import FormattedDate, { FormattedDateProps } from './FormattedDate';

const defaultProps: FormattedDateProps = {
  date: new Date(Date.UTC(2022, 1, 4)),
  locale: 'en-GB',
};

const subject = (props: FormattedDateProps) => render(<FormattedDate {...props} />);

describe('FormattedDate', () => {
  it('formats a Date like `04 - Feb - 22`', () => {
    const { queryByText, container } = subject(defaultProps);

    const actualFormattedDate = container.querySelector('.tc__formatted-date');
    const actualDayText = queryByText('04');
    const actualMonthText = queryByText('Feb');
    const actualYearText = queryByText('22');

    expect(actualYearText).not.toBeNull();
    expect(actualMonthText).not.toBeNull();
    expect(actualDayText).not.toBeNull();

    expect(actualFormattedDate).toMatchSnapshot();
  });
});
