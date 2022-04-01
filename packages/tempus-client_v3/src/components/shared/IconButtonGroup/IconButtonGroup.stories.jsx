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
    selected: {
      control: {
        type: 'boolean',
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

const Template = args => (
  <div style={style}>
    <IconButtonGroup {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  types: ['grid-view', 'list-view'],
};
