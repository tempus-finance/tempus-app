import { FC, Fragment, memo, useMemo } from 'react';
import Typography, { TypographyVariant, TypographyWeight } from '../Typography';
import './FormattedDate.scss';

type FormattedDateSize = 'small' | 'medium' | 'large';

interface FormattedDateProps {
  date: Date;
  size?: FormattedDateSize;
  separatorContrast?: 'low' | 'high';
  dateParts?: Set<Intl.DateTimeFormatPartTypes>;
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
  const { date, size = 'medium', separatorContrast = 'high', dateParts = new Set(['day', 'month', 'year']) } = props;
  const formattedDateParts = useMemo(
    () =>
      new Intl.DateTimeFormat(window.navigator.language, formatOptions)
        .formatToParts(date)
        .filter(part => dateParts.has(part.type))
        .map(part => part.value.toString()),
    [date, dateParts],
  );
  const dateStyle = formattedDateStyleMap.get(size);

  if (!dateStyle) {
    return null;
  }

  return (
    <span className="tc__formatted-date">
      {formattedDateParts.map((part, index) => (
        <Fragment key={`formatted-date-part-${index}`}>
          <Typography variant={dateStyle.typographyVariant} type="mono" weight={dateStyle.typographyWeight}>
            {part}
          </Typography>
          {index < formattedDateParts.length - 1 && (
            <span
              className={`tc__formatted-date__separator tc__formatted-date__separator-${separatorContrast}-contrast`}
            ></span>
          )}
        </Fragment>
      ))}
    </span>
  );
};

export default memo(FormattedDate);
