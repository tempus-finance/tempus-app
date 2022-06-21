import { FC, memo, useCallback, useMemo } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Link from '../Link';
import Typography, { TypographyColor, TypographyVariant, TypographyWeight } from '../Typography';
import type { TabsSize } from './Tabs';

export interface TabProps {
  label: string;
  value?: any;
  href?: string;
  hrefPatterns?: string[];
  size?: TabsSize;
  selected?: any;
  onClick?: (value: any) => void;
}

interface TabStyleConfig {
  variant: TypographyVariant;
  textColor: TypographyColor;
  textColorSelected: TypographyColor;
  fontWeight: TypographyWeight;
  fontWeightSelected: TypographyWeight;
}

const tabStyleMap = new Map<TabsSize, TabStyleConfig>([
  [
    'small',
    {
      variant: 'body-secondary',
      textColor: 'text-primary',
      textColorSelected: 'text-primary-inverted',
      fontWeight: 'medium',
      fontWeightSelected: 'bold',
    },
  ],
  [
    'large',
    {
      variant: 'subtitle',
      textColor: 'primary-dark',
      textColorSelected: 'text-primary-inverted',
      fontWeight: 'regular',
      fontWeightSelected: 'bold',
    },
  ],
]);

const Tab: FC<TabProps> = props => {
  const { label, value, href, hrefPatterns, size = 'small', selected, onClick } = props;
  const tabStyle = tabStyleMap.get(size);

  const handleClick = useCallback(() => onClick?.(value), [onClick, value]);

  const labelComponent = useMemo(
    () =>
      tabStyle && (
        <Typography
          variant={tabStyle.variant}
          color={selected ? tabStyle.textColorSelected : tabStyle.textColor}
          weight={selected ? tabStyle.fontWeightSelected : tabStyle.fontWeight}
        >
          {label}
        </Typography>
      ),
    [selected, label, tabStyle],
  );

  if (!tabStyle || (!value && !href && !hrefPatterns)) {
    return null;
  }

  return props.href ? (
    <Link className="tc__tabs__tab" href={props.href}>
      {labelComponent}
    </Link>
  ) : (
    <ButtonWrapper className="tc__tabs__tab" onClick={handleClick} selected={selected}>
      {labelComponent}
    </ButtonWrapper>
  );
};

export default memo(Tab);
