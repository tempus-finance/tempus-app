import { ComponentStory } from '@storybook/react';
import { FC, useCallback, useState } from 'react';
import { IconVariant } from '../Icon';
import IconButtonGroup, { IconButtonGroupProps } from './IconButtonGroup';

export default {
  title: 'IconButtonGroup',
  component: IconButtonGroup,
  argTypes: {
    variants: {
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

const Wrapper: FC<IconButtonGroupProps> = props => {
  const [selectedVariant, setSelectedVariant] = useState<IconVariant>(props.selectedVariant ?? props.variants[0]);
  const onChange = useCallback((val: IconVariant) => setSelectedVariant(val), []);
  return <IconButtonGroup {...props} onChange={onChange} selectedVariant={selectedVariant} />;
};

const Template: ComponentStory<typeof IconButtonGroup> = args => (
  <div style={style}>
    <Wrapper {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  variants: ['grid-view', 'list-view'],
};
