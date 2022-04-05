import { ComponentStory, ComponentMeta } from '@storybook/react';
import { CSSProperties } from 'react';
import FormattedDate from './FormattedDate';

export default {
  title: 'FormattedDate',
  component: FormattedDate,
  argTypes: {
    date: {
      control: { type: 'date' },
    },
    separatorContrast: {
      options: ['low', 'high'],
      control: { type: 'radio' },
    },
  },
} as ComponentMeta<typeof FormattedDate>;

const style: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

const Template: ComponentStory<typeof FormattedDate> = props => {
  const { date, separatorContrast } = props;
  return (
    <div style={style}>
      <FormattedDate date={date} size="small" separatorContrast={separatorContrast} />
      <FormattedDate date={date} size="medium" separatorContrast={separatorContrast} />
      <FormattedDate date={date} size="large" separatorContrast={separatorContrast} />
    </div>
  );
};

export const StyledFormattedDate = Template.bind({});
StyledFormattedDate.args = {
  date: new Date(),
  separatorContrast: 'high',
};
