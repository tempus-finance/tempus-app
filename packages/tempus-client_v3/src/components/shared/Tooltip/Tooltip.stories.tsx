import { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Tooltip from './Tooltip';

export default {
  title: 'Tooltip',
  component: Tooltip,
  argTypes: {
    placement: {
      control: {
        type: 'select',
        options: ['bottom-left', 'bottom-right'],
      },
    },
  },
} as ComponentMeta<typeof Tooltip>;

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '50px',
};

const tooltipContentStyle = {
  width: '300px',
  padding: '16px',
};

const Template: ComponentStory<typeof Tooltip> = props => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggleTooltip = () => {
    setTooltipOpen(prevState => !prevState);
  };

  return (
    <div style={style}>
      <button type="button" onClick={toggleTooltip} style={{ position: 'relative' }}>
        Click me!
        {/* Tooltip should be placed inside it's anchor element - and anchor element must have relative position */}
        <Tooltip {...props} open={tooltipOpen}>
          {/* Content of the tooltip is placed inside tooltip as it's child element */}
          <div style={tooltipContentStyle}>Tooltip content</div>
        </Tooltip>
      </button>
    </div>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  placement: 'bottom-right',
};
