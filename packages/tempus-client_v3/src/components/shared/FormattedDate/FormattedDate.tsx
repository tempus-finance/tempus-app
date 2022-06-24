import { FC, Fragment, memo, useMemo } from 'react';
import Typography, { TypographyColor, TypographyVariant } from '../Typography';
import './FormattedDate.scss';

type FormattedDateSize = 'small' | 'medium' | 'large';

export interface FormattedDateProps {
  date: Date;
  locale: string;
  textColor?: TypographyColor;
  size?: FormattedDateSize;
  separatorContrast?: 'low' | 'high';
  dateParts?: Set<Intl.DateTimeFormatPartTypes>;
}

const formattedDateTypographyVariantMap: Record<FormattedDateSize, TypographyVariant> = {
  small: 'body-secondary',
  medium: 'body-primary',
  large: 'subheader',
};

const formatOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: '2-digit',
};

const FormattedDate: FC<FormattedDateProps> = props => {
  const {
    date,
    locale,
    textColor,
    size = 'medium',
    separatorContrast = 'high',
    dateParts = new Set(['day', 'month', 'year']),
  } = props;
  const formattedDateParts = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, formatOptions)
        .formatToParts(date)
        .filter(part => dateParts.has(part.type))
        .map(part => part.value.toString()),
    [date, locale, dateParts],
  );

  return (
    <span className="tc__formatted-date">
      {formattedDateParts.map((part, index) => (
        <Fragment key={`formatted-date-part-${index}`}>
          <Typography variant={formattedDateTypographyVariantMap[size]} type="mono" weight="medium" color={textColor}>
            {part}
          </Typography>
          {index < formattedDateParts.length - 1 && (
            <span
              className={`tc__formatted-date__separator tc__formatted-date__separator-${separatorContrast}-contrast`}
            />
          )}
        </Fragment>
      ))}
    </span>
  );
};

export default memo(FormattedDate);
