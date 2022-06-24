import { FC, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DecimalUtils } from 'tempus-core-services';
import { useLocale } from '../../../hooks';
import { MaturityTerm } from '../../../interfaces';
import ButtonWrapper from '../ButtonWrapper';
import FormattedDate from '../FormattedDate';
import Typography from '../Typography';

interface TermTabProps {
  term: MaturityTerm;
  selected: boolean;
  disabled?: boolean;
  onClick: (selected: MaturityTerm) => void;
}

const TermTab: FC<TermTabProps> = props => {
  const { term, selected, disabled, onClick } = props;
  const { t } = useTranslation();
  const [locale] = useLocale();

  const handleClick = useCallback(() => onClick(term), [term, onClick]);
  const formattedAprPercentage = useMemo(
    () => (term?.apr ? DecimalUtils.formatPercentage(term.apr, 1) : '0%'),
    [term.apr],
  );

  return (
    <ButtonWrapper
      className={`tc__term-tabs__term ${selected ? 'tc__term-tabs__term-selected' : ''}`}
      onClick={handleClick}
      disabled={disabled}
    >
      <Typography variant="body-secondary" weight="medium" color={disabled ? 'text-disabled' : 'text-secondary'}>
        {t('TermTab.title')}
      </Typography>
      <Typography variant="body-primary" type="mono" weight="bold" color={disabled ? 'text-disabled' : 'text-primary'}>
        {formattedAprPercentage}
      </Typography>
      <FormattedDate
        date={term.date}
        locale={locale}
        textColor={disabled ? 'text-disabled' : 'text-secondary'}
        size="small"
        separatorContrast="low"
      />
    </ButtonWrapper>
  );
};

export default memo(TermTab);
