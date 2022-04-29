import { ComponentStory, ComponentMeta } from '@storybook/react';
import { useCallback, useState } from 'react';
import { IconVariant } from '../Icon';
import Dropdown from './Dropdown';
import DropdownCheckboxItem from './DropdownCheckboxItem';
import DropdownSelectableItem from './DropdownSelectableItem';
import DropdownSelector from './DropdownSelector';

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

const SingleChoiceTemplate: ComponentStory<typeof Dropdown> = args => {
  const [selectedValue, setSelectedValue] = useState('a');

  return (
    <div style={style}>
      <DropdownSelector {...args} selectedValue={selectedValue} onSelect={setSelectedValue}>
        <DropdownSelectableItem label="Option A" value="a" />
        <DropdownSelectableItem label="Option B" value="b" />
        <DropdownSelectableItem label="Option C" value="c" />
      </DropdownSelector>
    </div>
  );
};

export const SingleChoice = SingleChoiceTemplate.bind({});
SingleChoice.args = {
  label: 'Filter',
  popupTitle: 'Title',
};

const SingleChoiceWithIconsTemplate: ComponentStory<typeof Dropdown> = args => {
  const [selectedValue, setSelectedValue] = useState('a');
  const [selectedIcon, setSelectedIcon] = useState<IconVariant>('up-arrow-thin');

  const handleSelect = useCallback(
    (value: string) => {
      if (value === selectedValue) {
        setSelectedIcon(selectedIcon === 'up-arrow-thin' ? 'down-arrow-thin' : 'up-arrow-thin');
      } else {
        setSelectedValue(value);
      }
    },
    [selectedIcon, selectedValue],
  );

  return (
    <div style={style}>
      <DropdownSelector {...args} itemIcon={selectedIcon} selectedValue={selectedValue} onSelect={handleSelect}>
        <DropdownSelectableItem label="Option A" value="a" />
        <DropdownSelectableItem label="Option B" value="b" />
        <DropdownSelectableItem label="Option C" value="c" />
      </DropdownSelector>
    </div>
  );
};

export const SingleChoiceWithIcons = SingleChoiceWithIconsTemplate.bind({});
SingleChoiceWithIcons.args = {
  label: 'Filter',
  popupTitle: 'Title',
};

const MultipleChoiceTemplate: ComponentStory<typeof Dropdown> = args => (
  <div style={style}>
    <Dropdown {...args}>
      <DropdownCheckboxItem label="Active" onChange={() => {}} />
      <DropdownCheckboxItem label="Matured" onChange={() => {}} />
      <DropdownCheckboxItem label="Inactive" onChange={() => {}} />
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
      <DropdownCheckboxItem label="Active" onChange={() => {}} icon="up-arrow-thin" />
      <DropdownCheckboxItem label="Matured" onChange={() => {}} />
      <DropdownCheckboxItem label="Inactive" onChange={() => {}} />
    </Dropdown>
  </div>
);

export const RightSideIcon = RightSideIconTemplate.bind({});
RightSideIcon.args = {
  label: 'Filter',
  popupTitle: 'Title',
};