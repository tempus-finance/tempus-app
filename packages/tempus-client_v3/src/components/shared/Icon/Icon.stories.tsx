import { ComponentStory } from '@storybook/react';
import React from 'react';
import Icon from './Icon';

export default {
  title: 'Icon',
  component: Icon,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-evenly',
  padding: '10px',
};

const Template: ComponentStory<typeof Icon> = args => (
  <div style={style}>
    <Icon {...args} size="tiny" />
    <Icon {...args} size="small" />
    <Icon {...args} size="medium" />
    <Icon {...args} size="large" />
    <Icon {...args} size={48} />
  </div>
);

export const Checkmark = Template.bind({});
Checkmark.args = {
  type: 'checkmark',
};

export const CheckmarkBordered = Template.bind({});
CheckmarkBordered.args = {
  type: 'checkmark-bordered',
};
export const CheckmarkRound = Template.bind({});
CheckmarkRound.args = {
  type: 'checkmark-round',
};

export const CheckmarkSolid = Template.bind({});
CheckmarkSolid.args = {
  type: 'checkmark-solid',
};

export const Close = Template.bind({});
Close.args = {
  type: 'close',
};

export const CrossRound = Template.bind({});
CrossRound.args = {
  type: 'cross-round',
};

export const Dark = Template.bind({});
Dark.args = {
  type: 'dark',
};

export const Discord = Template.bind({});
Discord.args = {
  type: 'discord',
};

export const DownArrow = Template.bind({});
DownArrow.args = {
  type: 'down-arrow',
};

export const DownArrowThin = Template.bind({});
DownArrowThin.args = {
  type: 'down-arrow-thin',
};

export const DownChevron = Template.bind({});
DownChevron.args = {
  type: 'down-chevron',
};

export const Exclamation = Template.bind({});
Exclamation.args = {
  type: 'exclamation',
};

export const ExclamationBordered = Template.bind({});
ExclamationBordered.args = {
  type: 'exclamation-bordered',
};

export const ExclamationError = Template.bind({});
ExclamationError.args = {
  type: 'exclamation-error',
};

export const ExclamationNeutral = Template.bind({});
ExclamationNeutral.args = {
  type: 'exclamation-neutral',
};

export const External = Template.bind({});
External.args = {
  type: 'external',
};

export const Github = Template.bind({});
Github.args = {
  type: 'github',
};

export const Globe = Template.bind({});
Globe.args = {
  type: 'globe',
};

export const GridView = Template.bind({});
GridView.args = {
  type: 'grid-view',
};

export const Info = Template.bind({});
Info.args = {
  type: 'info',
};

export const InfoBordered = Template.bind({});
InfoBordered.args = {
  type: 'info-bordered',
};

export const InfoSolid = Template.bind({});
InfoSolid.args = {
  type: 'info-solid',
};

export const LeftArrow = Template.bind({});
LeftArrow.args = {
  type: 'left-arrow',
};

export const LeftArrowThin = Template.bind({});
LeftArrowThin.args = {
  type: 'left-arrow-thin',
};

export const LeftChevron = Template.bind({});
LeftChevron.args = {
  type: 'left-chevron',
};

export const ListView = Template.bind({});
ListView.args = {
  type: 'list-view',
};

export const Medium = Template.bind({});
Medium.args = {
  type: 'medium',
};

export const Menu = Template.bind({});
Menu.args = {
  type: 'menu',
};

export const Minus = Template.bind({});
Minus.args = {
  type: 'minus',
};

export const MinusRound = Template.bind({});
MinusRound.args = {
  type: 'minus-round',
};

export const Plus = Template.bind({});
Plus.args = {
  type: 'plus',
};

export const PlusRound = Template.bind({});
PlusRound.args = {
  type: 'plus-round',
};

export const RightArrow = Template.bind({});
RightArrow.args = {
  type: 'right-arrow',
};

export const RightChevron = Template.bind({});
RightChevron.args = {
  type: 'right-chevron',
};

export const RightArrowThin = Template.bind({});
RightArrowThin.args = {
  type: 'right-arrow-thin',
};

export const Scroll = Template.bind({});
Scroll.args = {
  type: 'scroll',
};

export const Slippage = Template.bind({});
Slippage.args = {
  type: 'slippage',
};

export const Telegram = Template.bind({});
Telegram.args = {
  type: 'telegram',
};

export const Twitter = Template.bind({});
Twitter.args = {
  type: 'twitter',
};

export const UpArrow = Template.bind({});
UpArrow.args = {
  type: 'up-arrow',
};

export const UpArrowThin = Template.bind({});
UpArrowThin.args = {
  type: 'up-arrow-thin',
};

export const UpChevron = Template.bind({});
UpChevron.args = {
  type: 'up-chevron',
};
