import { ComponentStory } from '@storybook/react';
import IconButtonGroup from './IconButtonGroup';

export default {
  title: 'IconButtonGroup',
  component: IconButtonGroup,
  argTypes: {
    types: {
      control: {
        type: 'array',
      },
    },
  },
};

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
};

const Template: ComponentStory<typeof IconButtonGroup> = args => (
  <div style={style}>
    <IconButtonGroup {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  types: ['grid-view', 'list-view'],
  onChange: () => {},
};
