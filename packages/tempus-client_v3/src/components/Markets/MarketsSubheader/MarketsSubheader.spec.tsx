import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MarketsSubheader, {
  FilterType,
  MarketsSubheaderProps,
  PoolType,
  SortOrder,
  SortType,
  ViewType,
} from './MarketsSubheader';

const onPoolTypeChangeMock = jest.fn<void, [PoolType]>();
const onViewTypeChangeMock = jest.fn<void, [ViewType]>();
const onFilterChangeMock = jest.fn<void, [Set<FilterType>]>();
const onSortTypeChangeMock = jest.fn<void, [SortType, SortOrder]>();

const subject = (props: MarketsSubheaderProps) =>
  render(
    <BrowserRouter>
      <MarketsSubheader {...props} />
    </BrowserRouter>,
  );

describe('MarketsSubheader', () => {
  it('renders a navigation subheader with filtering and sorting options', () => {
    const { container } = subject({});

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('updates pool type', () => {
    const { container } = subject({ onPoolTypeChange: onPoolTypeChangeMock });

    const poolTypeButtons = container.querySelectorAll('.tc__tabs__tab');

    expect(poolTypeButtons).toHaveLength(3);

    expect(poolTypeButtons[0]).toHaveAttribute('data-selected', 'false');
    expect(poolTypeButtons[1]).toHaveAttribute('data-selected', 'false');
    expect(poolTypeButtons[2]).toHaveAttribute('data-selected', 'true');

    fireEvent.click(poolTypeButtons[1]);

    expect(poolTypeButtons[1]).toHaveAttribute('data-selected', 'true');

    expect(onPoolTypeChangeMock).toBeCalledTimes(1);
    expect(onPoolTypeChangeMock).toBeCalledWith('boosted');

    poolTypeButtons.forEach(button => expect(button).toMatchSnapshot());
  });

  it('updates view type', () => {
    const { container } = subject({ onViewTypeChange: onViewTypeChangeMock });

    const viewTypeButtons = container.querySelectorAll('.tc__iconButtonGroup .tc__btn');

    expect(viewTypeButtons).toHaveLength(2);

    expect(viewTypeButtons[0]).toHaveAttribute('data-selected', 'true');
    expect(viewTypeButtons[1]).toHaveAttribute('data-selected', 'false');

    fireEvent.click(viewTypeButtons[1]);

    expect(viewTypeButtons[0]).toHaveAttribute('data-selected', 'false');
    expect(viewTypeButtons[1]).toHaveAttribute('data-selected', 'true');

    expect(onViewTypeChangeMock).toBeCalledTimes(1);
    expect(onViewTypeChangeMock).toBeCalledWith('list');

    viewTypeButtons.forEach(button => expect(button).toMatchSnapshot());

    fireEvent.click(viewTypeButtons[0]);

    expect(onViewTypeChangeMock).toBeCalledTimes(2);
    expect(onViewTypeChangeMock).toBeCalledWith('grid');
  });

  it('updates filters', () => {
    const { container, getByRole } = subject({ onFilterChange: onFilterChangeMock });

    const filterButton = getByRole('button', { name: 'Filter' });
    expect(filterButton).not.toBeNull();

    fireEvent.click(filterButton);

    const filterTypeCheckboxes = container.querySelectorAll('.tc__dropdown:first-of-type input[type=checkbox]');
    expect(filterTypeCheckboxes).toHaveLength(3);

    const filterTypes: Array<FilterType> = ['active', 'matured', 'inactive'];

    filterTypeCheckboxes.forEach((checkbox, index) => {
      fireEvent.click(checkbox);

      expect(onFilterChangeMock).toBeCalledTimes(2 * index + 1);
      expect(onFilterChangeMock).toBeCalledWith(new Set<FilterType>([filterTypes[index]]));

      fireEvent.click(checkbox);

      expect(onFilterChangeMock).toBeCalledTimes(2 * index + 2);
      expect(onFilterChangeMock).toBeCalledWith(new Set<FilterType>());
    });
  });

  it('updates sorting type', () => {
    const { container, getByRole } = subject({ onSortTypeChange: onSortTypeChangeMock });

    const sortButton = getByRole('button', { name: 'Sort' });
    expect(sortButton).not.toBeNull();

    fireEvent.click(sortButton);

    const sortTypeButtons = container.querySelectorAll('.tc__dropdown:last-of-type .tc__dropdownItem button');
    expect(sortTypeButtons).toHaveLength(5);

    fireEvent.click(sortTypeButtons[2]);

    expect(onSortTypeChangeMock).toBeCalledTimes(1);
    expect(onSortTypeChangeMock).toBeCalledWith('tvl', 'asc');

    fireEvent.click(sortTypeButtons[2]);

    expect(onSortTypeChangeMock).toBeCalledTimes(2);
    expect(onSortTypeChangeMock).toBeCalledWith('tvl', 'desc');

    fireEvent.click(sortTypeButtons[2]);

    expect(onSortTypeChangeMock).toBeCalledTimes(3);
    expect(onSortTypeChangeMock).toBeCalledWith('tvl', 'asc');

    fireEvent.click(sortTypeButtons[1]);

    expect(onSortTypeChangeMock).toBeCalledTimes(4);
    expect(onSortTypeChangeMock).toBeCalledWith('maturity', 'asc');

    sortTypeButtons.forEach(button => expect(button).toMatchSnapshot());
  });
});
