import { FC } from 'react';
import { ActionButton, ActionButtonLabels } from '../shared';

interface ModalPreviewContentProps {
  actionButtonLabels: ActionButtonLabels;
  onActionButtonClick: () => void;
}

const ModalPreviewContent: FC<ModalPreviewContentProps> = props => {
  const { actionButtonLabels, onActionButtonClick, children } = props;

  return (
    <>
      {children}
      <div className="tc__currency-input-modal__action-container">
        <ActionButton
          labels={actionButtonLabels}
          onClick={onActionButtonClick}
          variant="primary"
          size="large"
          fullWidth
          state="default"
        />
      </div>
    </>
  );
};

export default ModalPreviewContent;
