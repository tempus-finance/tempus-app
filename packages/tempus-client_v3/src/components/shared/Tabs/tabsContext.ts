import { createContext } from 'react';
import { TabsSize } from './Tabs';

interface TabsContextType {
  size: TabsSize;
  selectedValue: any;
  onChange?: (value: any) => void;
}

export const TabsContext = createContext<TabsContextType>({
  size: 'small',
  selectedValue: null,
  onChange: undefined,
});
