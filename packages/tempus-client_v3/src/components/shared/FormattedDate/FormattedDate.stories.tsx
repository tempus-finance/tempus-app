import { Story } from '@storybook/react';
import FormattedDate, { FormattedDateProps } from './FormattedDate';

export default {
  title: 'FormattedDate',
  component: FormattedDate,
  argTypes: {
    date: {
      control: { type: 'date' },
    },
    size: {
      options: ['small', 'medium', 'large'],
      control: { type: 'radio' },
    },
    separatorContrast: {
      options: ['low', 'high'],
      control: { type: 'radio' },
    },
  },
};

const Template: Story<FormattedDateProps> = props => {
  const { date, size, separatorContrast } = props;
  return <FormattedDate date={date} size={size} separatorContrast={separatorContrast} />;
};

export const StyledFormattedDate = Template.bind({});
StyledFormattedDate.args = {
  date: new Date(2022, 3, 4),
  size: 'medium',
  separatorContrast: 'high',
};
