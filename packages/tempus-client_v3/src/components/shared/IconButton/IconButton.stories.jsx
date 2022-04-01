import IconButton from './IconButton';

export default {
  title: 'IconButton',
  component: IconButton,
  argTypes: {
    type: {
      control: {
        type: 'select',
        options: ['grid-view', 'list-view'],
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
    <IconButton {...args} />
  </div>
);

export const Selected = Template.bind({});
Selected.args = {
  type: 'grid-view',
  selected: true,
};

export const Deselected = Template.bind({});
Deselected.args = {
  type: 'grid-view',
  selected: false,
};
