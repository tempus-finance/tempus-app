import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useCallback, useState } from 'react';
import { ChainConfig, Decimal, Ticker } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { WithdrawModal } from './WithdrawModal';
import { pool1 } from '../../setupTests';

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
  const [config] = useState<ChainConfig>(getConfigManager().getChainConfig('ethereum'));

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
            precisionForUI: 4,
            address: '1',
            rate: new Decimal(3500),
            ticker: 'ETH',
            balance: new Decimal(1),
          },
          {
            precision: 18,
            precisionForUI: 4,
            address: '2',
            rate: new Decimal(3501),
            ticker: 'stETH',
            balance: new Decimal(1),
          },
        ]}
        open={modalOpen}
        onClose={onModalClose}
        chainConfig={config}
        tempusPool={pool1}
      />
    </div>
  );
};

export const Primary = Template.bind({});
