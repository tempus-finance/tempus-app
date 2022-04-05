import { FC, memo, useCallback, useMemo } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Link from '../Link';
import Typography, { TypographyColor, TypographyVariant, TypographyWeight } from '../Typography';
import { TabsSize } from './Tabs';

export interface TabProps {
  label: string;
  value?: any;
  href?: string;
  size?: TabsSize;
  selectedValue?: any;
  onClick?: (value: any) => void;
}

interface TabStyleConfig {
  variant: TypographyVariant;
  textColor: TypographyColor;
  textColorSelected: TypographyColor;
  fontWeight: TypographyWeight;
  fontWeightSelected: TypographyWeight;
}

const tabStyleMap = new Map<TabsSize, TabStyleConfig>();
tabStyleMap.set('small', {
  variant: 'body-secondary',
  textColor: 'text-primary',
  textColorSelected: 'text-primary-inverted',
  fontWeight: 'medium',
  fontWeightSelected: 'bold',
});
tabStyleMap.set('large', {
  variant: 'subtitle',
  textColor: 'primary-dark',
  textColorSelected: 'text-primary-inverted',
  fontWeight: 'regular',
  fontWeightSelected: 'bold',
});

const Tab: FC<TabProps> = props => {
  const { label, value, href, size = 'small', selectedValue, onClick } = props;

  const isSelected = selectedValue === href || selectedValue === value;
  const tabStyle = tabStyleMap.get(size);

  const handleClick = useCallback(() => onClick?.(value), [onClick, value]);

  const labelComponent = useMemo(
    () =>
      tabStyle && (
        <Typography
          variant={tabStyle.variant}
          color={isSelected ? tabStyle.textColorSelected : tabStyle.textColor}
          weight={isSelected ? tabStyle.fontWeightSelected : tabStyle.fontWeight}
        >
          {label}
        </Typography>
      ),
    [isSelected, label, tabStyle],
  );

  if (!tabStyle || (!value && !href)) {
    return null;
  }

  return props.href ? (
    <Link className="tc__tabs__tab" href={props.href}>
      {labelComponent}
    </Link>
  ) : (
    <ButtonWrapper className="tc__tabs__tab" onClick={handleClick}>
      {labelComponent}
    </ButtonWrapper>
  );
};

export default memo(Tab);
