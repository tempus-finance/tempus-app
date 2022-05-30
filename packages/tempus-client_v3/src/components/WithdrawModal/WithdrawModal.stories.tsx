import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useCallback, useEffect, useState } from 'react';
import { ChainConfig, Decimal, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { WithdrawModal } from './WithdrawModal';

export default {
  title: 'WithdrawModal',
  component: WithdrawModal,
  argTypes: {},
} as ComponentMeta<typeof WithdrawModal>;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
};

const singleCurrencyUsdRates = new Map<Ticker, Decimal>();
singleCurrencyUsdRates.set('ETH', new Decimal(3500));

const Template: ComponentStory<typeof WithdrawModal> = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [config, setConfig] = useState<ChainConfig | undefined>();

  useEffect(() => {
    const retrieveConfig = async () => {
      const configManager = getConfigManager();
      configManager.init().then(success => {
        if (success) {
          setConfig(configManager.getChainConfig('ethereum'));
        }
      });
    };

    retrieveConfig();
  }, []);

  const onModalOpen = useCallback(() => {
    setModalOpen(true);
  }, []);

  const onModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <div style={style}>
      <button type="button" onClick={onModalOpen}>
        Click me!
      </button>

      <WithdrawModal
        tokens={[
          {
            precision: 18,
            rate: new Decimal(3500),
            ticker: 'ETH',
          },
          {
            precision: 18,
            rate: new Decimal(3501),
            ticker: 'stETH',
          },
        ]}
        open={modalOpen}
        onClose={onModalClose}
        chainConfig={config}
      />
    </div>
  );
};

export const Primary = Template.bind({});
