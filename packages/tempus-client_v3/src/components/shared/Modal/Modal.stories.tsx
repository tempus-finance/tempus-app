import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useCallback, useState } from 'react';
import Typography from '../Typography';

import Modal from './Modal';

export default {
  title: 'Modal',
  component: Modal,
  argTypes: {},
} as ComponentMeta<typeof Modal>;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
};

const Template: ComponentStory<typeof Modal> = () => {
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

      <Modal open={modalOpen} onClose={onModalClose}>
        <Typography variant="body-primary">Modal content</Typography>
      </Modal>
    </div>
  );
};

export const Primary = Template.bind({});
