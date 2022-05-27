import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Decimal } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { useActivePoolList, useInactivePoolList, useMaturedPoolList, useTvlData, usePoolBalances } from '../../hooks';
import Markets from './Markets';

const subject = () =>
  render(
    <BrowserRouter>
      <Markets />
    </BrowserRouter>,
  );

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useActivePoolList: jest.fn(),
  useInactivePoolList: jest.fn(),
  useMaturedPoolList: jest.fn(),
  usePoolBalances: jest.fn(),
  useTvlData: jest.fn(),
}));

describe('Markets', () => {
  beforeAll(async () => {
    const config = getConfigManager();
    await config.init();
  });

  beforeEach(() => {
    (useActivePoolList as jest.Mock).mockImplementation(() => getConfigManager().getPoolList().slice(0, -2));
    (useInactivePoolList as jest.Mock).mockImplementation(() => getConfigManager().getPoolList().slice(-2, -1));
    (useMaturedPoolList as jest.Mock).mockImplementation(() => getConfigManager().getPoolList().slice(-1));
    (usePoolBalances as jest.Mock).mockReturnValue({
      'ethereum-1': new Decimal(500),
      'ethereum-2': new Decimal(700),
      'fantom-3': new Decimal(200),
      'fantom-4': new Decimal(900),
    });
    (useTvlData as jest.Mock).mockReturnValue({
      'ethereum-1': new Decimal(5000),
      'ethereum-2': new Decimal(7000),
      'fantom-3': new Decimal(2000),
      'fantom-4': new Decimal(9000),
    });
  });

  it('renders the page', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('render pools after updates pool type to boosted', () => {
    const { container } = subject();

    const poolTypeButtons = container.querySelectorAll('.tc__tabs__tab');

    fireEvent.click(poolTypeButtons[1]);

    expect(container).toMatchSnapshot();
  });

  it('render pools after updates filters', () => {
    const { container, getByRole } = subject();

    const filterButton = getByRole('button', { name: 'Filter' });
    expect(filterButton).not.toBeNull();

    fireEvent.click(filterButton);

    const filterTypeCheckboxes = container.querySelectorAll('.tc__dropdown:first-of-type input[type=checkbox]');
    expect(filterTypeCheckboxes).toHaveLength(3);

    filterTypeCheckboxes.forEach(filterTypeCheckbox => {
      fireEvent.click(filterTypeCheckbox);

      expect(container).toMatchSnapshot();
    });
  });

  it('render pools after updates sorting types', () => {
    const { container, getByRole } = subject();

    const sortButton = getByRole('button', { name: 'Sort' });
    expect(sortButton).not.toBeNull();

    fireEvent.click(sortButton);

    const sortTypeButtons = container.querySelectorAll('.tc__dropdown:last-of-type .tc__dropdownItem button');
    expect(sortTypeButtons).toHaveLength(5);

    sortTypeButtons.forEach(button => {
      fireEvent.click(button);

      expect(container).toMatchSnapshot();

      fireEvent.click(button);

      expect(container).toMatchSnapshot();
    });
  });
});
