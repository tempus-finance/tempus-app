import { FC, memo, useContext, useMemo } from 'react';
import Button from '../Button';
import Link from '../Link';
import Typography, { TypographyColor, TypographyVariant, TypographyWeight } from '../Typography';
import { TabsSize } from './Tabs';
import { TabsContext } from './tabsContext';

interface TabProps {
  label: string;
  value?: any;
  href?: string;
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
  const { label, value, href } = props;
  const { size, selectedValue, onChange } = useContext(TabsContext);
  const isSelected = selectedValue === href || selectedValue === value;
  const tabStyle = tabStyleMap.get(size);
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
    <Button className="tc__tabs__tab" onClick={() => onChange && onChange(value)}>
      {labelComponent}
    </Button>
  );
};

export default memo(Tab);
