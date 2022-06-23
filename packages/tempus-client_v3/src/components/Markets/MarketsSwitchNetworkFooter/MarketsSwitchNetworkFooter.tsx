import { useSetChain } from '@web3-onboard/react';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { chainNameToHexChainId, prettifyChainName } from 'tempus-core-services';
import { getConfigManager } from '../../../config/getConfigManager';
import { useSelectedChain } from '../../../hooks';
import ChainSelector from '../../ChainSelector';
import { ActionButton, Typography } from '../../shared';

import './MarketsSwitchNetworkFooter.scss';

const MarketsSwitchNetworkFooter: FC = () => {
  const chainList = getConfigManager().getChainList();
  const [, setChain] = useSetChain();
  const [selectedChain] = useSelectedChain();
  const { t } = useTranslation();

  const [chainSelectorOpen, setChainSelectorOpen] = useState<boolean>(false);

  const otherChains = useMemo(() => chainList.filter(chain => chain !== selectedChain), [chainList, selectedChain]);

  const title = useMemo(() => {
    if (otherChains.length === 1) {
      const chainName = prettifyChainName(otherChains[0]);
      return t('MarketsSwitchNetworkFooter.titleSingleChain', { chainName });
    }

    return t('MarketsSwitchNetworkFooter.titleMultipleChains');
  }, [otherChains, t]);

  const description = useMemo(() => {
    if (otherChains.length === 1) {
      const chainName = prettifyChainName(otherChains[0]);
      return t('MarketsSwitchNetworkFooter.descriptionSingleChain', { chainName });
    }

    return t('MarketsSwitchNetworkFooter.descriptionMultipleChains');
  }, [otherChains, t]);

  const handleSwitchClick = useCallback(() => {
    if (otherChains.length === 1) {
      const hexChainId = chainNameToHexChainId(otherChains[0]);

      if (hexChainId) {
        setChain({
          chainId: hexChainId,
        });
      }
    } else {
      setChainSelectorOpen(true);
    }
  }, [otherChains, setChain]);

  const onCloseChainSelector = useCallback(() => {
    setChainSelectorOpen(false);
  }, []);

  return selectedChain ? (
    <>
      <ChainSelector open={chainSelectorOpen} onClose={onCloseChainSelector} />
      <div className="tc__markets-switch-network-footer">
        <Typography variant="body-primary" weight="bold" color="text-disabled">
          {title}
        </Typography>
        <div className="tc__markets-switch-network-footer__separator" />
        <Typography variant="body-primary" color="text-disabled">
          {description}
        </Typography>
        <ActionButton variant="secondary" labels={{ default: 'Switch' }} onClick={handleSwitchClick} />
      </div>
    </>
  ) : null;
};

export default MarketsSwitchNetworkFooter;
