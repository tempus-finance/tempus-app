import { FC, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Decimal } from 'tempus-core-services';
import { ActionButton, ActionButtonLabels, Icon, InfoTooltip, Modal, SlippageInput, Typography } from '../shared';
import { useUserPreferences } from '../../hooks';
import { ModalProps } from '../shared/Modal/Modal';
import HungryCatLogo from './HungryCatLogo';

import './ErrorModal.scss';

export interface SlippageErrorModalProps extends ModalProps {
  primaryButtonLabel: ActionButtonLabels;
  onPrimaryButtonClick: () => void;
}

const SlippageErrorModal: FC<SlippageErrorModalProps> = props => {
  const { open, onClose, title, primaryButtonLabel, onPrimaryButtonClick } = props;
  const { t } = useTranslation();
  const [preference, setPreferences] = useUserPreferences();

  const handleSlippageUpdate = useCallback((slippage: Decimal) => setPreferences({ slippage }), [setPreferences]);
  const handleSlippageAutoUpdate = useCallback(
    (slippageAuto: boolean) => setPreferences({ slippageAuto }),
    [setPreferences],
  );

  return (
    <Modal open={open} onClose={onClose}>
      <div className="tc__error-modal__content">
        <Typography className="tc__error-modal__title" variant="subtitle" weight="bold">
          {title}
        </Typography>
        <Typography variant="body-primary">{t('SlippageErrorModal.errorModalDescription')}</Typography>
        <div className="tc__error-modal__animation">
          <HungryCatLogo />
        </div>
        <div className="tc__error-modal__input">
          <Icon variant="slippage" size={20} />
          <Typography className="tc__error-modal__input-title" variant="body-primary" weight="medium">
            {t('SlippageErrorModal.titleSlippage')}
          </Typography>
          <InfoTooltip tooltipContent={t('SlippageErrorModal.slippageTooltipContent')} iconSize="small" />
          <SlippageInput
            percentage={preference.slippage}
            isAuto={preference.slippageAuto}
            onPercentageUpdate={handleSlippageUpdate}
            onAutoUpdate={handleSlippageAutoUpdate}
          />
        </div>
        <div className="tc__error-modal__action-buttons">
          <ActionButton labels={primaryButtonLabel} onClick={onPrimaryButtonClick} variant="primary" size="large" />
        </div>
      </div>
    </Modal>
  );
};

export default memo(SlippageErrorModal);
