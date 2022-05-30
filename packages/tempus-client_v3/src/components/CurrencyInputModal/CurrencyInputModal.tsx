import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { ChainConfig, Decimal, Ticker } from 'tempus-core-services';
import { ActionButtonLabels, ActionButtonState, ButtonWrapper, Icon, Modal, Typography } from '../shared';
import { ModalProps } from '../shared/Modal/Modal';
import TermTabs, { MaturityTerm } from '../shared/TermTabs';
import './CurrencyInputModal.scss';
import ModalActionContent from './ModalActionContent';
import ModalPreviewContent from './ModalPreviewContent';

type CurrencyInputModalContent = 'preview' | 'action';

interface CurrencyInputModalDescription {
  preview: string;
  action: string;
}

export interface CurrencyInputModalActionButtonLabels {
  preview?: ActionButtonLabels;
  action: ActionButtonLabels;
}

export interface CurrencyInputModalProps extends ModalProps {
  description: string | CurrencyInputModalDescription;
  preview?: ReactNode;
  balance: Decimal;
  tokens: {
    precision: number;
    ticker: Ticker;
    rate: Decimal;
  }[];
  maturityTerms?: MaturityTerm[];
  chainConfig?: ChainConfig;
  infoRows?: ReactNode;
  actionButtonLabels: CurrencyInputModalActionButtonLabels;
  actionButtonState?: ActionButtonState;
  onMaturityChange?: (term: MaturityTerm) => void;
  onAmountChange?: (amount: Decimal) => void;
  onTransactionStart: (amount: Decimal) => string;
  onCurrencyUpdate?: (currency: Ticker) => void;
}

const CurrencyInputModal: FC<CurrencyInputModalProps> = props => {
  const {
    title,
    description,
    open,
    onClose,
    header,
    preview,
    balance,
    tokens,
    maturityTerms,
    chainConfig,
    infoRows,
    actionButtonLabels,
    actionButtonState = 'default',
    onMaturityChange,
    onAmountChange,
    onTransactionStart,
    onCurrencyUpdate,
  } = props;

  const [content, setContent] = useState<CurrencyInputModalContent>(preview ? 'preview' : 'action');

  const handlePreviewButtonClick = useCallback(() => setContent('action'), []);

  const handleBack = useCallback(() => setContent('preview'), []);

  const modalTitle = useMemo(() => {
    if (content === 'preview') {
      return title;
    }

    return (
      <div className="tc__currency-input-modal__nav">
        <ButtonWrapper onClick={handleBack}>
          <Icon variant="left-chevron" size="small" />
        </ButtonWrapper>
        <Typography variant="subtitle" weight="bold">
          {title}
        </Typography>
      </div>
    );
  }, [content, handleBack, title]);

  const disabledInput = actionButtonState !== 'default';

  return (
    <Modal
      className="tc__currency-input-modal"
      variant="styled"
      size="large"
      title={modalTitle}
      header={header}
      open={open}
      onClose={onClose}
    >
      <Typography className="tc__currency-input-modal__description" variant="body-primary">
        {typeof description === 'string' && description}
        {typeof description !== 'string' && (content === 'preview' ? description.preview : description.action)}
      </Typography>
      {maturityTerms && (content === 'preview' || maturityTerms.length > 1) && (
        <TermTabs terms={maturityTerms} disabled={disabledInput} onChange={onMaturityChange} />
      )}
      {content === 'preview' && (
        <ModalPreviewContent
          actionButtonLabels={actionButtonLabels.preview ?? actionButtonLabels.action}
          onActionButtonClick={handlePreviewButtonClick}
        >
          {preview}
        </ModalPreviewContent>
      )}
      {content === 'action' && (
        <ModalActionContent
          balance={balance}
          disabledInput={disabledInput}
          tokens={tokens}
          chainConfig={chainConfig}
          infoRows={infoRows}
          actionButtonLabels={actionButtonLabels.action}
          actionButtonState={actionButtonState}
          onAmountChange={onAmountChange}
          onTransactionStart={onTransactionStart}
          onCurrencyUpdate={onCurrencyUpdate}
        />
      )}
    </Modal>
  );
};

export default CurrencyInputModal;
