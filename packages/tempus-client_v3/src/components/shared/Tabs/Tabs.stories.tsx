import { Meta, Story } from '@storybook/react';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Tab from './Tab';
import Tabs, { TabsSize } from './Tabs';

export default {
  title: 'Tabs',
  component: Tabs,
  argTypes: {
    size: {
      options: ['small', 'large'],
      control: { type: 'radio' },
    },
  },
};

interface TabsProps {
  size: TabsSize;
  value: any;
}

const ButtonTabsTemplate: Story<TabsProps> = (props: TabsProps) => {
  const { size } = props;
  const [selectedTab, setSelectedTab] = useState('item1');
  const onChange = useCallback(value => setSelectedTab(value), []);

  return (
    <BrowserRouter>
      <Tabs size={size} value={selectedTab} onChange={onChange}>
        <Tab label="Item #1" value="item1" />
        <Tab label="Item #2" value="item2" />
        <Tab label="Item #3" value="item3" />
      </Tabs>
    </BrowserRouter>
  );
};

export const ButtonTabs = ButtonTabsTemplate.bind({});

ButtonTabs.args = {
  size: 'small',
};

const DefaultRoutes = (props: PropsWithChildren<{}>) => {
  const { children } = props;
  const navigate = useNavigate();

  useEffect(() => navigate('/item1'), []);

  return <Routes>{children}</Routes>;
};

const LinkTabsTemplate: Story<TabsProps> = (props: TabsProps) => {
  const { size } = props;
  const element = (
    <Tabs size={size}>
      <Tab label="Item #1" href="/item1" />
      <Tab label="Item #2" href="/item2" />
      <Tab label="Item #3" href="/item3" />
    </Tabs>
  );

  return (
    <BrowserRouter>
      <DefaultRoutes>
        <Route path="/item1" element={element} />
        <Route path="/item2" element={element} />
        <Route path="/item3" element={element} />
      </DefaultRoutes>
    </BrowserRouter>
  );
};

export const LinkTabs = LinkTabsTemplate.bind({});

LinkTabs.args = {
  size: 'small',
};
