import { ComponentMeta } from '@storybook/react';
import { FC } from 'react';
import TermTabs from './TermTabs';

export default {
  title: 'TermTabs',
  component: TermTabs,
  argTypes: {},
} as ComponentMeta<typeof TermTabs>;

export const TwoTermDates: FC = () => (
  <TermTabs
    terms={[
      {
        apr: 0.042,
        date: new Date(Date.UTC(2022, 0, 1)),
      },
      {
        apr: 0.1,
        date: new Date(Date.UTC(2022, 5, 1)),
      },
    ]}
  />
);

export const ThreeTermDates: FC = () => (
  <TermTabs
    terms={[
      {
        apr: 0.042,
        date: new Date(Date.UTC(2022, 0, 1)),
      },
      {
        apr: 0.1,
        date: new Date(Date.UTC(2022, 5, 1)),
      },
      {
        apr: 0.125,
        date: new Date(Date.UTC(2022, 10, 1)),
      },
    ]}
  />
);
