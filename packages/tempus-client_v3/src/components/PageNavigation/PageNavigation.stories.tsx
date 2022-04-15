import { ComponentStory } from '@storybook/react';
import { CSSProperties } from 'react';
import { BrowserRouter } from 'react-router-dom';
import PageNavigation from './PageNavigation';

export default {
  title: 'PageNavigation',
  component: PageNavigation,
  argTypes: {},
};

const style: CSSProperties = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '20px',
};

const Template: ComponentStory<typeof PageNavigation> = args => (
  <BrowserRouter>
    <div style={style}>
      <PageNavigation {...args} />
    </div>
  </BrowserRouter>
);

export const Example1 = Template.bind({});
Example1.args = {
  navigationLinks: [
    { text: 'Markets', path: '/' },
    { text: 'Portfolio', path: '/portfolio' },
  ],
};

export const Example2 = Template.bind({});
Example2.args = {
  navigationLinks: [
    { text: 'Markets', path: '/' },
    { text: 'LP', path: '/lp' },
    { text: 'Staking', path: '/staking' },
    { text: 'Portfolio', path: '/portfolio' },
  ],
};
