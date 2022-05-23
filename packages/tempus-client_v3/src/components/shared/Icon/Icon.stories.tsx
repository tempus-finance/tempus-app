import { ComponentStory } from '@storybook/react';
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
  variant: 'checkmark',
};

export const CheckmarkBordered = Template.bind({});
CheckmarkBordered.args = {
  variant: 'checkmark-bordered',
};
export const CheckmarkRound = Template.bind({});
CheckmarkRound.args = {
  variant: 'checkmark-round',
};

export const CheckmarkSolid = Template.bind({});
CheckmarkSolid.args = {
  variant: 'checkmark-solid',
};

export const Close = Template.bind({});
Close.args = {
  variant: 'close',
};

export const CrossRound = Template.bind({});
CrossRound.args = {
  variant: 'cross-round',
};

export const Dark = Template.bind({});
Dark.args = {
  variant: 'dark',
};

export const Discord = Template.bind({});
Discord.args = {
  variant: 'discord',
};

export const DownArrow = Template.bind({});
DownArrow.args = {
  variant: 'down-arrow',
};

export const DownArrowThin = Template.bind({});
DownArrowThin.args = {
  variant: 'down-arrow-thin',
};

export const DownChevron = Template.bind({});
DownChevron.args = {
  variant: 'down-chevron',
};

export const Exclamation = Template.bind({});
Exclamation.args = {
  variant: 'exclamation',
};

export const ExclamationBordered = Template.bind({});
ExclamationBordered.args = {
  variant: 'exclamation-bordered',
};

export const ExclamationError = Template.bind({});
ExclamationError.args = {
  variant: 'exclamation-error',
};

export const ExclamationNeutral = Template.bind({});
ExclamationNeutral.args = {
  variant: 'exclamation-neutral',
};

export const External = Template.bind({});
External.args = {
  variant: 'external',
};

export const Github = Template.bind({});
Github.args = {
  variant: 'github',
};

export const Globe = Template.bind({});
Globe.args = {
  variant: 'globe',
};

export const GridView = Template.bind({});
GridView.args = {
  variant: 'grid-view',
};

export const Info = Template.bind({});
Info.args = {
  variant: 'info',
};

export const InfoBordered = Template.bind({});
InfoBordered.args = {
  variant: 'info-bordered',
};

export const InfoSolid = Template.bind({});
InfoSolid.args = {
  variant: 'info-solid',
};

export const LeftArrow = Template.bind({});
LeftArrow.args = {
  variant: 'left-arrow',
};

export const LeftArrowThin = Template.bind({});
LeftArrowThin.args = {
  variant: 'left-arrow-thin',
};

export const LeftChevron = Template.bind({});
LeftChevron.args = {
  variant: 'left-chevron',
};

export const ListView = Template.bind({});
ListView.args = {
  variant: 'list-view',
};

export const Medium = Template.bind({});
Medium.args = {
  variant: 'medium',
};

export const Menu = Template.bind({});
Menu.args = {
  variant: 'menu',
};

export const Minus = Template.bind({});
Minus.args = {
  variant: 'minus',
};

export const MinusRound = Template.bind({});
MinusRound.args = {
  variant: 'minus-round',
};

export const Plus = Template.bind({});
Plus.args = {
  variant: 'plus',
};

export const PlusRound = Template.bind({});
PlusRound.args = {
  variant: 'plus-round',
};

export const RightArrow = Template.bind({});
RightArrow.args = {
  variant: 'right-arrow',
};

export const RightChevron = Template.bind({});
RightChevron.args = {
  variant: 'right-chevron',
};

export const RightArrowThin = Template.bind({});
RightArrowThin.args = {
  variant: 'right-arrow-thin',
};

export const Scroll = Template.bind({});
Scroll.args = {
  variant: 'scroll',
};

export const Slippage = Template.bind({});
Slippage.args = {
  variant: 'slippage',
};

export const Telegram = Template.bind({});
Telegram.args = {
  variant: 'telegram',
};

export const Twitter = Template.bind({});
Twitter.args = {
  variant: 'twitter',
};

export const UpArrow = Template.bind({});
UpArrow.args = {
  variant: 'up-arrow',
};

export const UpArrowThin = Template.bind({});
UpArrowThin.args = {
  variant: 'up-arrow-thin',
};

export const UpChevron = Template.bind({});
UpChevron.args = {
  variant: 'up-chevron',
};
