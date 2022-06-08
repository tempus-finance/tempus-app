import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useCallback, useState } from 'react';

import SuccessModal from './SuccessModal';

export default {
  title: 'SuccessModal',
  component: SuccessModal,
  argTypes: {},
} as ComponentMeta<typeof SuccessModal>;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
};

const Template: ComponentStory<typeof SuccessModal> = () => {
  const [modalOpen, setModalOpen] = useState(false);

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

      <SuccessModal
        open={modalOpen}
        onClose={onModalClose}
        title="Deposit Complete!"
        description="You have deposited 0.5 ETH with 10/10/2022 term. It should reach your wallet momentarily. "
        primaryButtonLabel={{ default: 'Deposit in another pool', loading: '', success: '' }}
        onPrimaryButtonClick={() => {}}
        secondaryButtonLabel={{ default: 'Manage Portfolio', loading: '', success: '' }}
        onSecondaryButtonClick={() => {}}
      />
    </div>
  );
};

export const Primary = Template.bind({});
