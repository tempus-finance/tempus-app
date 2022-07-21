import { FC, memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { prettifyChainName, prettifyProtocolName, TempusPool } from 'tempus-core-services';
import { useConfig, useLocale } from '../../../hooks';
import { TransactionData } from '../../../interfaces/Notification';
import { FormattedDate, Icon, Link, Logo, Typography } from '../../shared';

interface WithdrawContentProps {
  data: TransactionData;
  tempusPool: TempusPool;
}

const WithdrawContent: FC<WithdrawContentProps> = props => {
  const { data, tempusPool } = props;
  const { t } = useTranslation();
  const config = useConfig();
  const [locale] = useLocale();

  const token = useMemo(() => {
    switch (data.tokenAddress) {
      case tempusPool.backingTokenAddress:
        return tempusPool.backingToken;
      case tempusPool.yieldBearingTokenAddress:
        return tempusPool.yieldBearingToken;
      default:
        return '';
    }
  }, [data.tokenAddress, tempusPool]);
  console.log(token, data, tempusPool);

  return (
    <div className="tc__wallet-popup__transaction-list__deposit-withdraw-content">
      {data.timestamp && (
        <div className="tc__wallet-popup__transaction-list__deposit-withdraw-content-timestamp">
          <FormattedDate
            date={new Date(data.timestamp)}
            locale={locale}
            size="tiny"
            dateParts={new Set(['hour', 'minute', 'second'])}
            customizedFormatOptions={{ hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }}
          />
          <FormattedDate
            date={new Date(data.timestamp)}
            locale={locale}
            size="tiny"
            dateParts={new Set(['dayPeriod'])}
            customizedFormatOptions={{ hour: '2-digit', hour12: true }}
          />
          <span className="tc__wallet-popup__transaction-list__deposit-withdraw-content-timestamp__separator" />
          <FormattedDate
            date={new Date(data.timestamp)}
            locale={locale}
            size="tiny"
            customizedFormatOptions={{ year: 'numeric' }}
          />
        </div>
      )}
      <div className="tc__wallet-popup__transaction-list__deposit-withdraw-content-detail">
        <Trans i18nKey="WithdrawContent.descriptionDetail" t={t}>
          <Typography variant="body-secondary" weight="medium" />
          <Typography variant="body-secondary" weight="bold">
            {{ amount: data.tokenAmount, token }}
          </Typography>
        </Trans>
      </div>
      <div className="tc__wallet-popup__transaction-list__deposit-withdraw-content-protocol">
        <Trans i18nKey="WithdrawContent.descriptionProtocol" t={t}>
          <Typography variant="body-secondary" weight="medium">
            {{ chainTokenStr: `${prettifyChainName(data.chain)} - ${tempusPool.backingToken}` }}
          </Typography>
          <Typography variant="body-secondary" />
          <Logo type={`protocol-${tempusPool.protocol}`} size={16} />
          <Typography variant="body-secondary" weight="medium">
            {{ protocolStr: prettifyProtocolName(tempusPool.protocol) }}
          </Typography>
        </Trans>
      </div>
      <div className="tc__wallet-popup__transaction-list__deposit-withdraw-content-term">
        <Trans i18nKey="WithdrawContent.descriptionTerm" t={t}>
          <Typography variant="body-secondary" weight="medium" color="text-secondary" />
          <FormattedDate
            date={new Date(tempusPool.maturityDate)}
            locale={locale}
            size="small"
            customizedFormatOptions={{ year: 'numeric' }}
          />
        </Trans>
      </div>
      {data.error && (
        <div className="tc__wallet-popup__transaction-list__deposit-withdraw-content-error">
          <Typography variant="body-secondary" weight="medium">
            {t('WithdrawContent.titleErrorDetail')}
          </Typography>
          <Typography variant="body-tertiary" type="mono">
            {data.error}
          </Typography>
        </div>
      )}
      {data.txnHash && config[data.chain] && (
        <div className="tc__wallet-popup__transaction-list__deposit-withdraw-content-link">
          <Link
            href={`${config[data.chain].blockExplorerUrl}tx/${data.txnHash}`}
            className="tc__currency-input-modal__transaction-link"
          >
            <Typography variant="body-secondary">
              {t('WithdrawContent.linkBlockExplorer', { name: config[data.chain].blockExplorerName })}
            </Typography>
            <Icon variant="external" size="small" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default memo(WithdrawContent);
