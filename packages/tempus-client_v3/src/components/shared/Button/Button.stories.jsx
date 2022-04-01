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
    <Button {...args.small}>My Button</Button>
    <div style={{ width: '20px' }} />
    <Button {...args.large}>My Button</Button>
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  small: {
    title: 'primary',
    size: 'small',
    variant: 'primary',
  },
  large: {
    title: 'primary',
    size: 'large',
    variant: 'primary',
  },
};

export const Secondary = Template.bind({});
Secondary.args = {
  small: {
    title: 'secondary',
    size: 'small',
    variant: 'secondary',
  },
  large: {
    title: 'secondary',
    size: 'large',
    variant: 'secondary',
  },
};
