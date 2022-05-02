import { ComponentStory, ComponentMeta } from '@storybook/react';
import { CSSProperties } from 'react';
import ProgressBar from './ProgressBar';

export default {
  title: 'ProgressBar',
  component: ProgressBar,
  argTypes: {},
} as ComponentMeta<typeof ProgressBar>;

const style: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexDirection: 'column',
  width: '300px',
  height: '180px',
};

const Template: ComponentStory<typeof ProgressBar> = () => (
  <div style={style}>
    {[...Array(6).keys()].map(index => (
      <ProgressBar value={20 * index} />
    ))}
  </div>
);

export const Primary = Template.bind({});
