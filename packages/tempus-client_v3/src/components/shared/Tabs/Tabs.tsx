import { Children, cloneElement, isValidElement, memo, ReactElement } from 'react';
import { useLocation } from 'react-router-dom';
import { TabProps } from './Tab';
import './tabs.scss';

export type TabsSize = 'small' | 'large';

interface TabsProps {
  size: TabsSize;
  value?: any;
  onChange?: (value: any) => void;
  children?: ReactElement<TabProps> | ReactElement<TabProps>[];
}

const Tabs = (props: TabsProps) => {
  const location = useLocation();
  const { size, value = location.pathname, onChange, children } = props;
  const values = Children.map(children, child => child?.props.href ?? child?.props.value);

  if (!values) {
    return null;
  }

  const selectedTabIndex = values.findIndex(tabValue => tabValue === value);
  const tabWidth = 100 / values.length;

  return (
    <div className={`tc__tabs tc__tabs__tabs-${size}`}>
      {Children.map(children, child => {
        return isValidElement(child)
          ? cloneElement(child, { size: size, selectedValue: value, onChange: onChange })
          : null;
      })}
      <div className="tc__tabs__indicator-container">
        {selectedTabIndex > -1 && (
          <div
            className="tc__tabs__indicator"
            style={{ width: `${tabWidth}%`, left: `${selectedTabIndex * tabWidth}%` }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default memo(Tabs);
