import { render } from '@testing-library/react';
import { Decimal } from 'tempus-core-services';
import TotalValueLocked from './TotalValueLocked';

const mockTvlValue = new Decimal('12345678');

jest.mock('../../hooks/useTvlData', () => ({
  useTvlData: () => [mockTvlValue],
}));

const subject = () => render(<TotalValueLocked />);

describe('TotalValueLockedfrom', () => {
  beforeAll(() => {
    jest.resetAllMocks();
  });

  it('renders a component that displays TVL value', () => {
    const { container, getByText } = subject();

    const component = container.querySelector('.tc__totalValueLocked');
    const tvl = getByText(/\$12,345,678.00/);

    expect(component).not.toBeNull();
    expect(tvl).not.toBeNull();
    expect(component).toMatchSnapshot();
  });
});
