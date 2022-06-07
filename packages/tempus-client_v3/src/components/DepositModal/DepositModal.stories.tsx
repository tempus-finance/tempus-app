import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useCallback, useEffect, useState } from 'react';
import { ChainConfig, Decimal } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { MaturityTerm } from '../../interfaces';
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
      configManager.init();

      setConfig(configManager.getChainConfig('ethereum'));
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

      <DepositModal
        tokens={[
          {
            precision: 6,
            precisionForUI: 2,
            address: '1',
            rate: new Decimal(1),
            ticker: 'USDC',
            balance: new Decimal(15),
          },
          {
            precision: 6,
            precisionForUI: 2,
            address: '2',
            rate: new Decimal(1),
            ticker: 'yvUSDC',
            balance: new Decimal(15),
          },
        ]}
        poolStartDate={new Date(2022, 3, 1)}
        maturityTerms={maturityTerms}
        open={modalOpen}
        onClose={onModalClose}
        chainConfig={config}
      />
    </div>
  );
};

export const Primary = Template.bind({});
