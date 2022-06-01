import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConfig, chainIdToChainName, Ticker, ZERO } from 'tempus-core-services';
import {
  setPoolForYieldAtMaturity,
  setTokenAmountForYieldAtMaturity,
  useDepositModalData,
  useWalletBalances,
} from '../../hooks';
import { MaturityTerm, TokenMetadataProp } from '../../interfaces';
import { ModalProps } from '../shared/Modal/Modal';
import { ActionButtonState, ChartDot, SelectableChartDataPoint, PercentageDateChart } from '../shared';
import CurrencyInputModal, { CurrencyInputModalActionButtonLabels } from '../CurrencyInputModal';
import DepositModalHeader from './DepositModalHeader';
import DepositModalInfoRows from './DepositModalInfoRows';

import './DepositModal.scss';

export interface DepositModalProps extends ModalProps {
  tokens: TokenMetadataProp;
  poolStartDate: Date;
  maturityTerms: MaturityTerm[];
  chainConfig?: ChainConfig;
}

const DepositModal: FC<DepositModalProps> = props => {
  const { tokens, open, onClose, poolStartDate, maturityTerms, chainConfig } = props;
  const [maturityTerm, setMaturityTerm] = useState(maturityTerms[0]);
  const [token, setToken] = useState(tokens[0]);
  const [approved, setApproved] = useState(false);
  const [actionButtonState, setActionButtonState] = useState<ActionButtonState>('default');
  const balances = useWalletBalances();
  const { t } = useTranslation();

  const useDepositModalProps = useDepositModalData();
  const modalProps = useDepositModalProps();

  const actionButtonLabels: CurrencyInputModalActionButtonLabels = {
    preview: {
      default: t('DepositModal.labelMakeDeposit'),
      loading: '',
      success: '',
    },
    action: approved
      ? {
          default: t('DepositModal.labelExecuteDefault'),
          loading: t('DepositModal.labelExecuteLoading'),
          success: t('DepositModal.labelExecuteSuccess'),
        }
      : {
          default: t('DepositModal.labelApproveDefault'),
          loading: t('DepositModal.labelApproveLoading'),
          success: t('DepositModal.labelApproveSuccess'),
        },
  };

  const balance = useMemo(() => {
    const chain = chainConfig?.chainId ? chainIdToChainName(chainConfig?.chainId) : undefined;
    return balances[`${chain}-${token.address}`] ?? ZERO;
  }, [balances, chainConfig?.chainId, token.address]);

  const chartData = useMemo(
    () =>
      [{ date: poolStartDate, apr: 0 }, ...maturityTerms].map(term => ({
        x: term.date,
        y: term.apr,
        visible: term.date !== poolStartDate,
        selected: term === maturityTerm,
      })) as SelectableChartDataPoint<Date, number>[],
    [maturityTerm, maturityTerms, poolStartDate],
  );

  const chartDot = useCallback(
    (_x, _y, index, cx, cy) => {
      const { visible, selected } = chartData[index];

      if (visible) {
        return <ChartDot variant="tick" selected={selected} centerX={cx} centerY={cy} key={`chart-dot-${cx}-${cy}`} />;
      }
      return undefined;
    },
    [chartData],
  );

  const depositYieldChart = useMemo(
    () => (
      <div>
        <PercentageDateChart height={329} data={chartData} dot={chartDot} />
      </div>
    ),
    [chartData, chartDot],
  );

  const handleMaturityChange = useCallback(
    (newTerm: MaturityTerm) => {
      const termIndex = maturityTerms.findIndex(term => term.date === newTerm.date) ?? 0;
      const selectedPool = modalProps?.pools[termIndex];

      if (selectedPool) {
        setPoolForYieldAtMaturity(selectedPool);
      }

      setMaturityTerm(newTerm);
    },
    [maturityTerms, modalProps?.pools],
  );

  const handleCurrencyChange = useCallback(
    (newCurrency: Ticker) => {
      const newToken = tokens.find(value => value.ticker === newCurrency);

      if (newToken) {
        setToken(newToken);
      }
    },
    [tokens],
  );

  const approveDeposit = useCallback(() => {
    // TODO: Implement approve deposit function
    setActionButtonState('loading');

    setTimeout(() => {
      setActionButtonState('success');

      setTimeout(() => {
        setActionButtonState('default');
        setApproved(true);
      }, 3000);
    }, 5000);

    return '0x0';
  }, []);

  const deposit = useCallback(() => {
    // TODO: Implement deposit function
    setActionButtonState('loading');

    setTimeout(() => {
      setActionButtonState('success');
    }, 5000);

    return '0x0';
  }, []);

  return (
    <CurrencyInputModal
      tokens={tokens}
      open={open}
      onClose={onClose}
      title={t('DepositModal.title')}
      description={{ preview: t('DepositModal.previewDescription'), action: t('DepositModal.description') }}
      preview={depositYieldChart}
      header={<DepositModalHeader />}
      maturityTerms={maturityTerms}
      balance={balance}
      infoRows={<DepositModalInfoRows balance={balance} balanceToken={token} yieldToken={tokens[1]} />}
      actionButtonLabels={actionButtonLabels}
      actionButtonState={actionButtonState}
      onTransactionStart={approved ? deposit : approveDeposit}
      onMaturityChange={handleMaturityChange}
      onAmountChange={setTokenAmountForYieldAtMaturity}
      onCurrencyUpdate={handleCurrencyChange}
      chainConfig={chainConfig}
    />
  );
};

export default DepositModal;
