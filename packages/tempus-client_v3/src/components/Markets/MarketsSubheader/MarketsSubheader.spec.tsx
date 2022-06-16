import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Decimal } from 'tempus-core-services';
import MarketsSubheader from './MarketsSubheader';
import I18nProvider from '../../../i18n/I18nProvider';
import { getConfigManager } from '../../../config/getConfigManager';
import {
  useSelectedChain,
  useActivePoolList,
  useInactivePoolList,
  useMaturedPoolList,
  useTvlData,
  usePoolBalances,
} from '../../../hooks';

const subject = () =>
  render(
    <BrowserRouter>
      <I18nProvider>
        <MarketsSubheader />
      </I18nProvider>
    </BrowserRouter>,
  );

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useSelectedChain: jest.fn(),
  useActivePoolList: jest.fn(),
  useInactivePoolList: jest.fn(),
  useMaturedPoolList: jest.fn(),
  usePoolBalances: jest.fn(),
  useTvlData: jest.fn(),
}));

describe('MarketsSubheader', () => {
  beforeAll(async () => {
    const config = getConfigManager();
    await config.init();
  });

  beforeEach(() => {
    (useSelectedChain as jest.Mock).mockReturnValue([null]);
    (useActivePoolList as jest.Mock).mockImplementation(() => getConfigManager().getPoolList().slice(0, -2));
    (useInactivePoolList as jest.Mock).mockImplementation(() => getConfigManager().getPoolList().slice(-2, -1));
    (useMaturedPoolList as jest.Mock).mockImplementation(() => getConfigManager().getPoolList().slice(-1));
    (usePoolBalances as jest.Mock).mockReturnValue({
      'ethereum-1': new Decimal(500),
      'ethereum-2': new Decimal(700),
      'fantom-3': new Decimal(200),
      'fantom-4': new Decimal(900),
      'fantom-5': new Decimal(800),
    });
    (useTvlData as jest.Mock).mockReturnValue({
      'ethereum-1': new Decimal(5000),
      'ethereum-2': new Decimal(7000),
      'fantom-3': new Decimal(2000),
      'fantom-4': new Decimal(9000),
      'fantom-5': new Decimal(8000),
    });
  });

  it('renders a navigation subheader with filtering and sorting options', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('updates filters', () => {
    const { container, getByRole } = subject();

    const filterButton = getByRole('button', { name: 'Filter' });
    expect(filterButton).not.toBeNull();

    fireEvent.click(filterButton);

    const filterPopup = container.querySelector('.tc__nav-subheader__group .tc__dropdown .tc__dropdown__popup');
    expect(filterPopup).toMatchSnapshot();

    const filterTypeRadios = container.querySelectorAll('.tc__dropdown:first-of-type input[type=radio]');
    expect(filterTypeRadios).toHaveLength(3);

    filterTypeRadios.forEach(filterTypeRadio => {
      fireEvent.click(filterTypeRadio);

      expect(filterTypeRadio).toMatchSnapshot();
    });
  });

  it('updates filters with selected chain', () => {
    (useSelectedChain as jest.Mock).mockReturnValue(['ethereum']);
    const { container, getByRole } = subject();

    const filterButton = getByRole('button', { name: 'Filter' });
    expect(filterButton).not.toBeNull();

    fireEvent.click(filterButton);

    const filterPopup = container.querySelector('.tc__nav-subheader__group .tc__dropdown .tc__dropdown__popup');
    expect(filterPopup).toMatchSnapshot();

    const filterTypeRadios = container.querySelectorAll('.tc__dropdown:first-of-type input[type=radio]');
    expect(filterTypeRadios).toHaveLength(3);

    filterTypeRadios.forEach(filterTypeRadio => {
      fireEvent.click(filterTypeRadio);

      expect(filterTypeRadio).toMatchSnapshot();
    });
  });

  it('updates sorting type', () => {
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

    sortTypeButtons.forEach(button => expect(button).toMatchSnapshot());
  });
});
