import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MarketsSubheader from './MarketsSubheader';
import { FilterType } from '../../../interfaces';
import I18nProvider from '../../../i18n/I18nProvider';

const mockSetPoolViewOptionsMock = jest.fn();
const mockPoolViewOptions = {
  viewType: 'grid',
  poolType: 'all',
  filters: new Set(),
  sortType: 'a-z',
  sortOrder: 'asc',
};

const subject = () =>
  render(
    <BrowserRouter>
      <I18nProvider>
        <MarketsSubheader />
      </I18nProvider>
    </BrowserRouter>,
  );

jest.mock('../../../hooks', () => ({
  usePoolViewOptions: jest.fn(() => {
    return [mockPoolViewOptions, mockSetPoolViewOptionsMock];
  }),
}));

// TODO: fix the mock hook later
describe('MarketsSubheader', () => {
  xit('renders a navigation subheader with filtering and sorting options', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  xit('updates pool type', () => {
    const { container } = subject();

    const poolTypeButtons = container.querySelectorAll('.tc__tabs__tab');

    expect(poolTypeButtons).toHaveLength(3);

    expect(poolTypeButtons[0]).toHaveAttribute('data-selected', 'false');
    expect(poolTypeButtons[1]).toHaveAttribute('data-selected', 'false');
    expect(poolTypeButtons[2]).toHaveAttribute('data-selected', 'true');

    fireEvent.click(poolTypeButtons[1]);

    expect(poolTypeButtons[1]).toHaveAttribute('data-selected', 'true');

    expect(mockSetPoolViewOptionsMock).toBeCalledTimes(1);
    expect(mockSetPoolViewOptionsMock).toBeCalledWith({ poolType: 'boosted' });

    poolTypeButtons.forEach(button => expect(button).toMatchSnapshot());
  });

  xit('updates view type', () => {
    const { container } = subject();

    const viewTypeButtons = container.querySelectorAll('.tc__iconButtonGroup .tc__btn');

    expect(viewTypeButtons).toHaveLength(2);

    expect(viewTypeButtons[0]).toHaveAttribute('data-selected', 'true');
    expect(viewTypeButtons[1]).toHaveAttribute('data-selected', 'false');

    fireEvent.click(viewTypeButtons[1]);

    expect(viewTypeButtons[0]).toHaveAttribute('data-selected', 'false');
    expect(viewTypeButtons[1]).toHaveAttribute('data-selected', 'true');

    expect(mockSetPoolViewOptionsMock).toBeCalledTimes(1);
    expect(mockSetPoolViewOptionsMock).toBeCalledWith({ viewType: 'boosted' });

    viewTypeButtons.forEach(button => expect(button).toMatchSnapshot());

    fireEvent.click(viewTypeButtons[0]);

    expect(mockSetPoolViewOptionsMock).toBeCalledTimes(1);
    expect(mockSetPoolViewOptionsMock).toBeCalledWith({ viewType: 'grid' });
  });

  xit('updates filters', () => {
    const { container, getByRole } = subject();

    const filterButton = getByRole('button', { name: 'Filter' });
    expect(filterButton).not.toBeNull();

    fireEvent.click(filterButton);

    const filterTypeCheckboxes = container.querySelectorAll('.tc__dropdown:first-of-type input[type=checkbox]');
    expect(filterTypeCheckboxes).toHaveLength(3);

    const filterTypes: Array<FilterType> = ['active', 'matured', 'inactive'];

    filterTypeCheckboxes.forEach((checkbox, index) => {
      fireEvent.click(checkbox);

      expect(mockSetPoolViewOptionsMock).toBeCalledTimes(2 * index + 1);
      expect(mockSetPoolViewOptionsMock).toBeCalledWith({ filters: new Set<FilterType>([filterTypes[index]]) });

      fireEvent.click(checkbox);

      expect(mockSetPoolViewOptionsMock).toBeCalledTimes(2 * index + 2);
      expect(mockSetPoolViewOptionsMock).toBeCalledWith({ filters: new Set<FilterType>() });
    });
  });

  xit('updates sorting type', () => {
    const { container, getByRole } = subject();

    const sortButton = getByRole('button', { name: 'Sort' });
    expect(sortButton).not.toBeNull();

    fireEvent.click(sortButton);

    const sortTypeButtons = container.querySelectorAll('.tc__dropdown:last-of-type .tc__dropdownItem button');
    expect(sortTypeButtons).toHaveLength(5);

    fireEvent.click(sortTypeButtons[2]);

    expect(mockSetPoolViewOptionsMock).toBeCalledTimes(1);
    expect(mockSetPoolViewOptionsMock).toBeCalledWith({ sortType: 'tvl', sortOrder: 'asc' });

    fireEvent.click(sortTypeButtons[2]);

    expect(mockSetPoolViewOptionsMock).toBeCalledTimes(2);
    expect(mockSetPoolViewOptionsMock).toBeCalledWith({ sortType: 'tvl', sortOrder: 'desc' });

    fireEvent.click(sortTypeButtons[2]);

    expect(mockSetPoolViewOptionsMock).toBeCalledTimes(3);
    expect(mockSetPoolViewOptionsMock).toBeCalledWith({ sortType: 'tvl', sortOrder: 'asc' });

    fireEvent.click(sortTypeButtons[1]);

    expect(mockSetPoolViewOptionsMock).toBeCalledTimes(4);
    expect(mockSetPoolViewOptionsMock).toBeCalledWith({ sortType: 'maturity', sortOrder: 'asc' });

    sortTypeButtons.forEach(button => expect(button).toMatchSnapshot());
  });
});
