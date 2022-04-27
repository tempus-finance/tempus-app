import { ComponentStory } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';

import Link from './Link';

export default {
  title: 'Link',
  component: Link,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const Template: ComponentStory<typeof Link> = args => (
  <div style={style}>
    <BrowserRouter>
      <Link {...args}>Link</Link>
    </BrowserRouter>
  </div>
);

export const GoogleLink = Template.bind({});
GoogleLink.args = {
  title: 'link to google',
  href: 'https://www.google.com',
};

export const RootLink = Template.bind({});
RootLink.args = {
  title: 'link to root',
  href: '/',
};
