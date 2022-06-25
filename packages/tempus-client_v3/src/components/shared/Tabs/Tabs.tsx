import { Children, isValidElement, memo, ReactElement, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import Tab, { TabProps } from './Tab';
import './tabs.scss';

export type TabsSize = 'small' | 'large';

export interface TabsProps {
  size: TabsSize;
  value?: any;
  onTabSelected?: (value: any) => void;
  children?: ReactElement<TabProps> | ReactElement<TabProps>[];
}

const Tabs = (props: TabsProps) => {
  const location = useLocation();
  const { size, value = location.pathname, onTabSelected, children } = props;

  const selectedTabIndex = useMemo(() => {
    const selectedIndex = Children.map(children, child => {
      if (child?.props.hrefPatterns) {
        return (
          child.props.hrefPatterns
            .map(pattern => matchPath(pattern, location.pathname) !== null)
            .filter(matched => matched).length > 0
        );
      }

      return value === child?.props.href || value === child?.props.value;
    })?.findIndex(matched => matched);

    return selectedIndex === undefined || selectedIndex < 0 ? undefined : selectedIndex;
  }, [children, location.pathname, value]);

  const tabWidth = useMemo(() => 100 / (children ? Children.count(children) : 1), [children]);

  return (
    <div className={`tc__tabs tc__tabs__tabs-${size}`}>
      {Children.map(children, (child, index) =>
        isValidElement(child) ? (
          <Tab {...child.props} size={size} selected={index === selectedTabIndex} onClick={onTabSelected} />
        ) : null,
      )}
      <div className="tc__tabs__indicator-container">
        {selectedTabIndex !== undefined && (
          <div
            className="tc__tabs__indicator"
            style={{ width: `${tabWidth}%`, left: `${selectedTabIndex * tabWidth}%` }}
          />
        )}
      </div>
    </div>
  );
};

export default memo(Tabs);
