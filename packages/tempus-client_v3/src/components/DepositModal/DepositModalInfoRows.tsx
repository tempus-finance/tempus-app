import { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Decimal, DecimalUtils } from 'tempus-core-services';
import { useYieldAtMaturity } from '../../hooks';
import { TokenMetadata } from '../../interfaces/TokenMetadata';
import { CurrencyInputModalInfoRow } from '../CurrencyInputModal';

interface DepositModalInfoRowsProps {
  balance: Decimal;
  balanceToken: TokenMetadata;
  yieldToken: TokenMetadata;
}

const DepositModalInfoRows: FC<DepositModalInfoRowsProps> = props => {
  const { balance, balanceToken, yieldToken } = props;
  const yieldAtMaturity = useYieldAtMaturity();
  const { t } = useTranslation();

  const formattedBalanceUsdValue = useMemo(() => {
    const usdValue = balance.mul(balanceToken.rate);
    return DecimalUtils.formatToCurrency(usdValue, undefined, '$');
  }, [balance, balanceToken.rate]);

  const formattedYieldUsdValue = useMemo(() => {
    const usdValue = yieldAtMaturity.mul(balanceToken.rate);
    return DecimalUtils.formatToCurrency(usdValue, undefined, '$');
  }, [balanceToken.rate, yieldAtMaturity]);

  return (
    <>
      <CurrencyInputModalInfoRow
        label={t('DepositModal.labelCurrentBalance')}
        value={DecimalUtils.formatToCurrency(balance, balanceToken.precisionForUI)}
        currency={balanceToken.ticker}
        usdValue={formattedBalanceUsdValue}
      />
      <CurrencyInputModalInfoRow
        label={t('DepositModal.labelYieldAtMaturity')}
        value={DecimalUtils.formatToCurrency(yieldAtMaturity, yieldToken.precisionForUI)}
        valueChange="increase"
        currency={yieldToken.ticker}
        usdValue={formattedYieldUsdValue}
      />
    </>
  );
};

export default memo(DepositModalInfoRows);
