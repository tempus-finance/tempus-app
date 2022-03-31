import React from 'react';

import Button from './Button';

export default {
  title: 'Button',
  component: Button,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const Template = args => (
  <div style={style}>
    <Button {...args}>My Button</Button>
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  title: 'primary',
};
