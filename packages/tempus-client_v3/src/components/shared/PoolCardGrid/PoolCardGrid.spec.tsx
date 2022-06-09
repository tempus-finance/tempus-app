import { fireEvent, render } from '@testing-library/react';
import { Chain, ProtocolName, Ticker } from 'tempus-core-services';
import { pool3, pool4, pool5 } from '../../../setupTests';
import { PoolCardStatus } from '../PoolCard';
import PoolCardGrid, {
  NUMBER_OF_CARDS_PER_PAGE,
  NUMBER_OF_CARDS_SHOW_AT_START,
  PoolCardData,
  PoolCardGridProps,
} from './PoolCardGrid';

const mockOnCardClick = jest.fn<void, [Chain, Ticker, ProtocolName, PoolCardStatus, string[]]>();

const dateNow = new Date(2023, 0, 1);

const defaultProps: PoolCardGridProps = {
  chain: 'fantom',
  // Pools are duplicated for testing "show more" button
  cards: [pool3, pool4, pool5, pool3, pool4, pool5, pool3, pool4, pool5, pool3].map(
    pool =>
      ({
        chain: pool.chain,
        token: pool.backingToken,
        tokenAddress: pool.backingTokenAddress,
        protocol: pool.protocol,
        matured: pool.maturityDate <= dateNow.getTime(),
        pools: [pool],
      } as PoolCardData),
  ),
  cardVariant: 'markets',
  onCardClick: mockOnCardClick,
};

const subject = (props: PoolCardGridProps) => render(<PoolCardGrid {...props} />);

describe('PoolCardGrid', () => {
  beforeEach(() => {
    // React complains because some cards have same `key` props. That happens as
    // there are duplicated pools in this test. In real world scenario, that
    // won't happen.
    jest.spyOn(console, 'error').mockImplementation();
  });

  it('renders a pool card grid', () => {
    const { container } = subject(defaultProps);

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('calls `onClick` when a pool card is clicked', () => {
    const { container } = subject(defaultProps);

    const poolCards = container.querySelectorAll('.tc__poolCard');

    expect(poolCards).toHaveLength(NUMBER_OF_CARDS_SHOW_AT_START);

    poolCards.forEach((poolCard, index) => {
      fireEvent.click(poolCard);

      const cardData = defaultProps.cards[index];

      expect(mockOnCardClick).toHaveBeenCalledTimes(index + 1);
      expect(mockOnCardClick).toHaveBeenCalledWith(
        cardData.chain,
        cardData.token,
        cardData.protocol,
        cardData.matured ? 'Matured' : 'Fixed',
        cardData.pools.map(pool => pool.address),
      );
    });
  });

  it('shows more cards when "Show more" button is clicked', () => {
    const { container } = subject(defaultProps);

    let poolCards = container.querySelectorAll('.tc__poolCard');

    expect(poolCards).toHaveLength(NUMBER_OF_CARDS_SHOW_AT_START);

    let showMoreButton = container.querySelector('.tc__actionButton');

    expect(showMoreButton).not.toBeNull();
    expect(showMoreButton).toHaveTextContent(
      `Show ${NUMBER_OF_CARDS_PER_PAGE} of ${defaultProps.cards.length - NUMBER_OF_CARDS_SHOW_AT_START}`,
    );
    expect(showMoreButton).toMatchSnapshot();

    fireEvent.click(showMoreButton as Element);

    poolCards = container.querySelectorAll('.tc__poolCard');
    const numberOfShownCards = NUMBER_OF_CARDS_SHOW_AT_START + NUMBER_OF_CARDS_PER_PAGE;

    expect(poolCards).toHaveLength(numberOfShownCards);

    expect(showMoreButton).toHaveTextContent(`Show ${defaultProps.cards.length - numberOfShownCards} more`);
    expect(showMoreButton).toMatchSnapshot();

    fireEvent.click(showMoreButton as Element);

    poolCards = container.querySelectorAll('.tc__poolCard');
    showMoreButton = container.querySelector('.tc__actionButton');

    expect(poolCards).toHaveLength(defaultProps.cards.length);
    expect(showMoreButton).toBeNull();
  });
});
