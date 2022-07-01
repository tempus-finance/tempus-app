import { FC, useCallback, useMemo, useState } from 'react';
import { Chain, ProtocolName, Ticker, ZERO } from 'tempus-core-services';
import { PoolCardStatus } from '../PoolCard';
import PoolCardGrid, { PoolCardData } from '../PoolCardGrid';
import PoolsHeading from '../PoolsHeading';

// ticker-protocol-cardStatus
export type PoolCardGroupId = string;

interface GroupedPoolCardGridProps {
  chain: Chain;
  cardGroups: Map<PoolCardGroupId, PoolCardData[]>;
  groupHeading: string | ((groupId: PoolCardGroupId) => string);
  onCardClick: (
    chain: Chain,
    ticker: Ticker,
    protocol: ProtocolName,
    status: PoolCardStatus,
    poolAddresses: string[],
  ) => void;
}

const GroupedPoolCardGrid: FC<GroupedPoolCardGridProps> = props => {
  const { chain, cardGroups, groupHeading, onCardClick } = props;

  const [selectedCardGroup, setSelectedCardGroup] = useState<PoolCardGroupId | undefined>();

  const cards = useMemo(
    () =>
      [...cardGroups.entries()].map(([groupId, cardsFromGroup]) => {
        const [token, protocol, cardStatus] = groupId.split('-');

        return {
          chain: cardsFromGroup[0].chain,
          token,
          tokenAddress: cardsFromGroup[0].tokenAddress,
          protocol,
          status: cardStatus,
          pools: cardsFromGroup.flatMap(card => card.pools),
          totalBalance: cardsFromGroup.reduce((sum, card) => sum.add(card.totalBalance ?? ZERO), ZERO),
          cardsInGroup: cardsFromGroup.length,
        } as PoolCardData;
      }),
    [cardGroups],
  );

  const handleBackButtonClick = useCallback(() => setSelectedCardGroup(undefined), []);

  const handleOnGroupClick = useCallback(
    (poolChain: Chain, token: Ticker, protocol: ProtocolName, cardStatus: PoolCardStatus, poolAddresses: string[]) => {
      const groupId: PoolCardGroupId = `${token}-${protocol}-${cardStatus}`;

      if (!cardGroups.has(groupId)) {
        return;
      }

      if (selectedCardGroup || cardGroups.get(groupId)?.length === 1) {
        onCardClick(poolChain, token, protocol, cardStatus, poolAddresses);
      } else {
        setSelectedCardGroup(groupId);
      }
    },
    [cardGroups, onCardClick, selectedCardGroup],
  );

  const selectedCardsFromGroup = selectedCardGroup ? cardGroups?.get(selectedCardGroup) : undefined;

  return selectedCardGroup && selectedCardsFromGroup ? (
    <div className="tc__grouped-pool-card-grid__expanded">
      <PoolsHeading
        text={typeof groupHeading === 'string' ? groupHeading : groupHeading(selectedCardGroup)}
        onBackButtonClick={handleBackButtonClick}
      />
      <PoolCardGrid chain={chain} cards={selectedCardsFromGroup} cardVariant="portfolio" onCardClick={onCardClick} />
    </div>
  ) : (
    <PoolCardGrid chain={chain} cards={cards} cardVariant="portfolio" onCardClick={handleOnGroupClick} />
  );
};

export default GroupedPoolCardGrid;
