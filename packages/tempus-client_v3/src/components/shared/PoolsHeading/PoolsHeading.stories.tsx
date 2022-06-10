import { ComponentStory, ComponentMeta } from '@storybook/react';

import PoolsHeading from './PoolsHeading';

export default {
  title: 'PoolsHeading',
  component: PoolsHeading,
  argTypes: {
    text: {
      control: {
        type: 'text',
      },
    },
    onBackButtonClick: {
      required: false,
      defaultValue: undefined,
    },
  },
} as ComponentMeta<typeof PoolsHeading>;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
};

const Template: ComponentStory<typeof PoolsHeading> = args => (
  <div style={style}>
    <PoolsHeading {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  text: 'Ethereum-network pools',
};
