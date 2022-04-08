import { ComponentStory, ComponentMeta } from '@storybook/react';

import Dropdown from './Dropdown';
import DropdownItem from './DropdownItem';

export default {
  title: 'Dropdown',
  component: Dropdown,
  argTypes: {
    label: {
      control: {
        type: 'text',
      },
    },
    popupTitle: {
      control: {
        type: 'text',
      },
    },
  },
} as ComponentMeta<typeof Dropdown>;

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
};

const RegularTemplate: ComponentStory<typeof Dropdown> = args => (
  <div style={style}>
    <Dropdown {...args}>
      <DropdownItem label="Option A" checkbox={false} onChange={() => {}} />
      <DropdownItem label="Option B" checkbox={false} onChange={() => {}} />
      <DropdownItem label="Option C" checkbox={false} onChange={() => {}} />
    </Dropdown>
  </div>
);

export const Regular = RegularTemplate.bind({});
Regular.args = {
  label: 'Filter',
  popupTitle: 'Title',
};

const MultipleChoiceTemplate: ComponentStory<typeof Dropdown> = args => (
  <div style={style}>
    <Dropdown {...args}>
      <DropdownItem label="Active" checkbox onChange={() => {}} />
      <DropdownItem label="Matured" checkbox onChange={() => {}} />
      <DropdownItem label="Inactive" checkbox onChange={() => {}} />
    </Dropdown>
  </div>
);

export const MultipleChoice = MultipleChoiceTemplate.bind({});
MultipleChoice.args = {
  label: 'Filter',
  popupTitle: 'Title',
};

const RightSideIconTemplate: ComponentStory<typeof Dropdown> = args => (
  <div style={style}>
    <Dropdown {...args}>
      <DropdownItem label="Active" checkbox onChange={() => {}} icon="up-arrow-thin" />
      <DropdownItem label="Matured" checkbox onChange={() => {}} />
      <DropdownItem label="Inactive" checkbox onChange={() => {}} />
    </Dropdown>
  </div>
);

export const RightSideIcon = RightSideIconTemplate.bind({});
RightSideIcon.args = {
  label: 'Filter',
  popupTitle: 'Title',
};
