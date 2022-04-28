import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
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

const Template: ComponentStory<typeof FeeTooltip> = () => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggleTooltip = () => {
    setTooltipOpen(prevState => !prevState);
  };

  return (
    <div style={style}>
      <button type="button" onClick={toggleTooltip} style={{ position: 'relative' }}>
        Click me!
        {/* Tooltip should be placed inside it's anchor element - and anchor element must have relative position */}
        <FeeTooltip open={tooltipOpen} fees={{ swap: 0.002 }} />
      </button>
    </div>
  );
};

export const Primary = Template.bind({});
