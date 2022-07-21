import { FC, memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useConfig, useLocale, useTokenSymbol } from '../../../hooks';
import { TransactionData } from '../../../interfaces/Notification';
import { FormattedDate, Icon, Link, Typography } from '../../shared';

interface ApproveContentProps {
  data: TransactionData;
}

const ApproveContent: FC<ApproveContentProps> = props => {
  const { data } = props;
  const { t } = useTranslation();
  const config = useConfig();
  const [locale] = useLocale();
  const token = useTokenSymbol(data.chain, data.tokenAddress) ?? data.tokenAddress;

  return (
    <div className="tc__wallet-popup__transaction-list__item-content">
      {data.timestamp && (
        <div className="tc__wallet-popup__transaction-list__item-content-timestamp">
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
          <span className="tc__wallet-popup__transaction-list__item-content-timestamp__separator" />
          <FormattedDate
            date={new Date(data.timestamp)}
            locale={locale}
            size="tiny"
            customizedFormatOptions={{ year: 'numeric' }}
          />
        </div>
      )}
      <div className="tc__wallet-popup__transaction-list__item-content-detail">
        <Trans i18nKey="ApproveContent.descriptionDetail" t={t}>
          <Typography variant="body-secondary" weight="medium" />
          <Typography variant="body-secondary" weight="bold">
            {{ amount: data.tokenAmount, token }}
          </Typography>
        </Trans>
      </div>
      {data.error && (
        <div className="tc__wallet-popup__transaction-list__item-content-error">
          <Typography variant="body-secondary" weight="medium">
            {t('DepositContent.titleErrorDetail')}
          </Typography>
          <Typography variant="body-tertiary" type="mono">
            {data.error}
          </Typography>
        </div>
      )}
      {data.txnHash && config[data.chain] && (
        <div className="tc__wallet-popup__transaction-list__item-content-link">
          <Link
            href={`${config[data.chain].blockExplorerUrl}tx/${data.txnHash}`}
            className="tc__currency-input-modal__transaction-link"
          >
            <Typography variant="body-secondary">
              {t('DepositContent.linkBlockExplorer', { name: config[data.chain].blockExplorerName })}
            </Typography>
            <Icon variant="external" size="small" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default memo(ApproveContent);
