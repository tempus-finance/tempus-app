import ActionButton from './ActionButton';

export default {
  title: 'ActionButton',
  component: ActionButton,
  argTypes: {
    labels: {
      control: {
        type: 'object',
      },
    },
    variant: {
      control: {
        type: 'select',
        options: ['primary', 'secondary', 'tertiary'],
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['small', 'large'],
      },
    },
    state: {
      control: {
        type: 'select',
        options: ['default', 'disabled', 'loading', 'success'],
      },
    },
    fullWidth: {
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
  width: '100%',
  height: '150px',
};

const Template = args => (
  <div style={style}>
    <ActionButton {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  labels: {
    default: 'Action Button',
    loading: 'Loading...',
    success: 'Success',
  },
  variant: 'primary',
  size: 'small',
  state: 'default',
  fullWidth: false,
};
