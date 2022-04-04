import { FC, memo, useMemo } from 'react';
import Typography, { TypographyVariant, TypographyWeight } from '../Typography';
import './FormattedDate.scss';

type FormattedDateSize = 'small' | 'medium' | 'large';

interface FormattedDateProps {
  date: Date;
  size?: FormattedDateSize;
  separatorContrast?: 'low' | 'high';
}

interface FormattedDateStyleConfig {
  typographyVariant: TypographyVariant;
  typographyWeight: TypographyWeight;
}

const formattedDateStyleMap = new Map<FormattedDateSize, FormattedDateStyleConfig>();
formattedDateStyleMap.set('small', {
  typographyVariant: 'body-secondary',
  typographyWeight: 'bold',
});
formattedDateStyleMap.set('medium', {
  typographyVariant: 'body-primary',
  typographyWeight: 'medium',
});
formattedDateStyleMap.set('large', {
  typographyVariant: 'subheader',
  typographyWeight: 'medium',
});

const formatOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: '2-digit',
};

const FormattedDate: FC<FormattedDateProps> = props => {
  const { date, size = 'medium', separatorContrast = 'high' } = props;
  const formattedDateParts = useMemo(
    () =>
      new Intl.DateTimeFormat(window.navigator.language, formatOptions)
        .formatToParts(date)
        .filter(part => part.type === 'day' || part.type === 'month' || part.type === 'year')
        .map(part => part.value.toString()),
    [date],
  );
  const dateStyle = formattedDateStyleMap.get(size);

  if (!dateStyle) {
    return null;
  }

  return (
    <span className="tc__formatted-date">
      <Typography variant={dateStyle.typographyVariant} type="mono" weight={dateStyle.typographyWeight}>
        {formattedDateParts[0]}
      </Typography>
      <span
        className={`tc__formatted-date__separator tc__formatted-date__separator-${separatorContrast}-contrast`}
      ></span>
      <Typography variant={dateStyle.typographyVariant} type="mono" weight={dateStyle.typographyWeight}>
        {formattedDateParts[1]}
      </Typography>
      <span
        className={`tc__formatted-date__separator tc__formatted-date__separator-${separatorContrast}-contrast`}
      ></span>
      <Typography variant={dateStyle.typographyVariant} type="mono" weight={dateStyle.typographyWeight}>
        {formattedDateParts[2]}
      </Typography>
    </span>
  );
};

export default memo(FormattedDate);
