import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useCallback, useState } from 'react';

import ErrorModal from './ErrorModal';

export default {
  title: 'ErrorModal',
  component: ErrorModal,
  argTypes: {},
} as ComponentMeta<typeof ErrorModal>;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
};

const Template: ComponentStory<typeof ErrorModal> = () => {
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

      <ErrorModal
        open={modalOpen}
        onClose={onModalClose}
        title="Something's wrong."
        description="An error occured and the transaction failed."
        primaryButtonLabel={{ default: 'Try again', loading: '', success: '' }}
        onPrimaryButtonClick={() => {}}
      />
    </div>
  );
};

export const Primary = Template.bind({});
