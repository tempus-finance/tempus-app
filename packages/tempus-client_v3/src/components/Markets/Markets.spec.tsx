import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { of as mockOf } from 'rxjs';
import { Decimal, Decimal as MockDecimal } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import {
  useActivePoolList,
  useInactivePoolList,
  useMaturedPoolList,
  useTvlData,
  usePoolBalances,
  useFixedAprs,
  useSelectedChain,
  useWalletAddress,
} from '../../hooks';
import Markets from './Markets';

const subject = () =>
  render(
    <BrowserRouter>
      <Markets />
    </BrowserRouter>,
  );

jest.mock('@web3-onboard/react', () => ({
  useSetChain: jest.fn().mockReturnValue([{ connectedChain: null }, () => {}]),
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useActivePoolList: jest.fn(),
  useInactivePoolList: jest.fn(),
  useMaturedPoolList: jest.fn(),
  usePoolBalances: jest.fn(),
  useSelectedChain: jest.fn(),
  useTvlData: jest.fn(),
  useWalletAddress: jest.fn(),
}));

jest.mock('../../hooks/useFixedAprs', () => ({
  ...jest.requireActual('../../hooks/useFixedAprs'),
  useFixedAprs: jest.fn(),
  poolAprs$: mockOf({
    'ethereum-1': new MockDecimal(0.041),
    'ethereum-2': new MockDecimal(0.038),
    'fantom-3': new MockDecimal(0.18),
    'fantom-4': new MockDecimal(0.106),
    'fantom-5': new MockDecimal(0.126),
  }),
}));

jest.mock('../../hooks/useTokenRates', () => ({
  ...jest.requireActual('../../hooks/useTokenRates'),
  useTokenRates: jest.fn(),
  tokenRates$: mockOf({
    'ethereum-0x0000000000000000000000000000000000000000': new MockDecimal(1),
    'ethereum-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': new MockDecimal(1),
    'ethereum-0x04068da6c83afcfa0e13ba15a6696662335d5b75': new MockDecimal(1),
    'ethereum-0x74b23882a30290451A17c44f4F05243b6b58C76d': new MockDecimal(1),
  }),
}));

describe('Markets', () => {
  beforeAll(async () => {
    const config = getConfigManager();
    config.init();
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
      'fantom-5': new Decimal(800),
    });
    (useSelectedChain as jest.Mock).mockReturnValue([null]);
    (useTvlData as jest.Mock).mockReturnValue({
      'ethereum-1': new Decimal(5000),
      'ethereum-2': new Decimal(7000),
      'fantom-3': new Decimal(2000),
      'fantom-4': new Decimal(9000),
      'fantom-5': new Decimal(8000),
    });
    (useFixedAprs as jest.Mock).mockReturnValue({
      'ethereum-1': new Decimal(0.041),
      'ethereum-2': new Decimal(0.038),
      'fantom-3': new Decimal(0.18),
      'fantom-4': new Decimal(0.106),
      'fantom-5': new Decimal(0.126),
    });
    (useWalletAddress as jest.Mock).mockReturnValue('0x123123123');
  });

  it('renders the page', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('render pools after updates filters', () => {
    const { container, getByRole } = subject();

    const filterButton = getByRole('button', { name: 'Filter' });
    expect(filterButton).not.toBeNull();

    fireEvent.click(filterButton);

    const filterTypeRadios = container.querySelectorAll('.tc__dropdown:first-of-type input[type=radio]');
    expect(filterTypeRadios).toHaveLength(3);

    filterTypeRadios.forEach(filterTypeRadio => {
      fireEvent.click(filterTypeRadio);

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
