import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '../shared';
import './DepositModal.scss';

const DepositModalHeader: FC = () => {
  const { t } = useTranslation();

  return (
    <span className="tc__deposit-modal__header">
      <Typography variant="body-secondary" weight="bold" color="text-success">
        {t('DepositModalHeader.titleRewardsAvailable')}
      </Typography>
    </span>
  );
};

export default DepositModalHeader;
