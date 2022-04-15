import { ComponentMeta } from '@storybook/react';
import { FC } from 'react';
import TermTabs from './TermTabs';

export default {
  title: 'TermTabs',
  component: TermTabs,
  argTypes: {},
} as ComponentMeta<typeof TermTabs>;

export const TwoTermDates: FC = () => <TermTabs dates={[new Date(2022, 7, 1), new Date(2022, 9, 1)]} />;

export const ThreeTermDates: FC = () => (
  <TermTabs dates={[new Date(2022, 7, 1), new Date(2022, 9, 1), new Date(2022, 11, 1)]} />
);
