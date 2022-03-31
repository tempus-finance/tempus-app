import React from 'react';

import Checkbox from './Checkbox';

export default {
  title: 'Checkbox',
  component: Checkbox,
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
    <Checkbox {...args} />
  </div>
);

export const Unchecked = Template.bind({});
Unchecked.args = {
  checked: false,
  label: 'unchecked',
};

export const Checked = Template.bind({});
Checked.args = {
  checked: true,
  label: 'checked',
};
