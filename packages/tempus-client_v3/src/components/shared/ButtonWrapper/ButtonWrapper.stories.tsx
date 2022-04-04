import { ComponentStory } from '@storybook/react';
import React from 'react';

import ButtonWrapper from './ButtonWrapper';

export default {
  title: 'ButtonWrapper',
  component: ButtonWrapper,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const Template: ComponentStory<typeof ButtonWrapper> = args => (
  <div style={style}>
    <ButtonWrapper {...args}>My Button Wrapper</ButtonWrapper>
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  title: 'primary',
};
