import { ComponentStory } from '@storybook/react';
import { FC, useCallback, useState } from 'react';
import { Decimal } from 'tempus-core-services';
import SlippageInput, { SlippageInputProps } from './SlippageInput';
import Typography from '../Typography';

export default {
  title: 'SlippageInput',
  component: SlippageInput,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const Wrapper: FC<SlippageInputProps> = props => {
  const [percentage, setPercentage] = useState<Decimal>(props.percentage ?? new Decimal(0));
  const [isAuto, setIsAuto] = useState<boolean>(props.isAuto ?? false);
  const onPercentageUpdate = useCallback((val: Decimal) => setPercentage(val), []);
  const onAutoUpdate = useCallback((val: boolean) => setIsAuto(val), []);
  return (
    <div>
      <SlippageInput
        {...props}
        percentage={percentage}
        isAuto={isAuto}
        onPercentageUpdate={onPercentageUpdate}
        onAutoUpdate={onAutoUpdate}
      />
      <hr />
      <Typography variant="body-secondary">Percentage: {percentage?.toString()}</Typography>
      <Typography variant="body-secondary">set Auto: {isAuto.toString()}</Typography>
    </div>
  );
};

const Template: ComponentStory<typeof SlippageInput> = args => (
  <div style={style}>
    <Wrapper {...args} />
  </div>
);

export const SlippageInputNormal = Template.bind({});
SlippageInputNormal.args = {
  percentage: new Decimal(0.02),
  isAuto: false,
  error: undefined,
  disabled: false,
};

export const SlippageInputAuto = Template.bind({});
SlippageInputAuto.args = {
  percentage: new Decimal(0.02),
  isAuto: true,
  error: undefined,
  disabled: false,
};

export const SlippageInputError = Template.bind({});
SlippageInputError.args = {
  percentage: new Decimal(0.02),
  isAuto: false,
  error: 'cannot exceed 100%',
  disabled: false,
};

export const SlippageInputDisabled = Template.bind({});
SlippageInputDisabled.args = {
  percentage: new Decimal(0.02),
  isAuto: false,
  error: undefined,
  disabled: true,
};
