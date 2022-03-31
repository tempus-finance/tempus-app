import { Children, FC, isValidElement, memo, PropsWithChildren } from 'react';
import { TabsContext } from './tabsContext';
import './tabs.scss';
import { useLocation } from 'react-router-dom';

export type TabsSize = 'small' | 'large';

interface TabsProps {
  size: TabsSize;
  value?: any;
  onChange?: (value: any) => void;
}

const Tabs: FC<PropsWithChildren<TabsProps>> = props => {
  const location = useLocation();
  const { size, value = location.pathname, onChange, children } = props;
  const validChildren = Children.map(children, child => {
    if (!isValidElement(child) || (!child.props.href && !child.props.value)) {
      return null;
    }

    return child;
  })?.filter(child => child != null);

  if (!validChildren) {
    return null;
  }

  const values = validChildren.map(child => child.props.href ?? child.props.value);
  const selectedTabIndex = values.findIndex(tabValue => tabValue === value);
  const tabWidth = 100 / values.length;

  return (
    <div className={`tc__tabs tc__tabs__tabs-${size}`}>
      <TabsContext.Provider value={{ size: size, selectedValue: value, onChange: onChange }}>
        {children}
        <div className="tc__tabs__indicator-container">
          {selectedTabIndex > -1 && (
            <div
              className="tc__tabs__indicator"
              style={{ width: `${tabWidth}%`, left: `${selectedTabIndex * tabWidth}%` }}
            ></div>
          )}
        </div>
      </TabsContext.Provider>
    </div>
  );
};

export default memo(Tabs);
