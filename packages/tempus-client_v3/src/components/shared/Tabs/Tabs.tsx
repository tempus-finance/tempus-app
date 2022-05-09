import { Children, isValidElement, memo, ReactElement, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
  const values = Children.map(children, child => child?.props.href ?? child?.props.value);
  const selectedTabIndex = useMemo(
    () => (values ? values.findIndex(tabValue => tabValue === value) : 0),
    [value, values],
  );

  const tabWidth = useMemo(() => 100 / (values ? values.length : 1), [values]);

  return (
    <div className={`tc__tabs tc__tabs__tabs-${size}`}>
      {Children.map(children, child =>
        isValidElement(child) ? (
          <Tab {...child.props} size={size} selectedValue={value} onClick={onTabSelected} />
        ) : null,
      )}
      <div className="tc__tabs__indicator-container">
        {selectedTabIndex > -1 && (
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
