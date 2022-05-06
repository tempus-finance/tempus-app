import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useCallback, useEffect, useState } from 'react';
import { ChainConfig, Decimal, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { MaturityTerm } from '../shared/TermTabs';
import DepositModal from './DepositModal';

export default {
  title: 'DepositModal',
  component: DepositModal,
  argTypes: {},
} as ComponentMeta<typeof DepositModal>;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
};

const singleCurrencyUsdRates = new Map<Ticker, Decimal>();
singleCurrencyUsdRates.set('ETH', new Decimal(3500));

const maturityTerms: MaturityTerm[] = [
  {
    apr: new Decimal(0.074),
    date: new Date(2022, 9, 1),
  },
  {
    apr: new Decimal(0.131),
    date: new Date(2022, 11, 1),
  },
];

const Template: ComponentStory<typeof DepositModal> = () => {
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

  const toggleModal = () => {
    setModalOpen(prevState => !prevState);
  };

  const onModalClose = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <div style={style}>
      <button type="button" onClick={toggleModal}>
        Click me!
      </button>

      <DepositModal
        inputPrecision={18}
        usdRates={singleCurrencyUsdRates}
        maturityTerms={maturityTerms}
        open={modalOpen}
        onClose={onModalClose}
        chainConfig={config}
      />
    </div>
  );
};

export const Primary = Template.bind({});
