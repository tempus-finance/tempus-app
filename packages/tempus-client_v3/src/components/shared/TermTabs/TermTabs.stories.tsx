import { ComponentMeta } from '@storybook/react';
import TermTabs from './TermTabs';

export default {
  title: 'TermTabs',
  component: TermTabs,
  argTypes: {},
} as ComponentMeta<typeof TermTabs>;

export const TwoTermDates = () => <TermTabs dates={[new Date(2022, 7, 1), new Date(2022, 9, 1)]} />;

export const ThreeTermDates = () => (
  <TermTabs dates={[new Date(2022, 7, 1), new Date(2022, 9, 1), new Date(2022, 11, 1)]} />
);
