import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Decimal } from 'tempus-core-services';
import FeeTooltip from './FeeTooltip';

export default {
  title: 'FeeTooltip',
  component: FeeTooltip,
  argTypes: {},
} as ComponentMeta<typeof FeeTooltip>;

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '50px',
};

const Template: ComponentStory<typeof FeeTooltip> = () => (
  <div style={style}>
    <FeeTooltip fees={{ swap: new Decimal(0.002) }}>Click me!</FeeTooltip>
  </div>
);

export const Primary = Template.bind({});
