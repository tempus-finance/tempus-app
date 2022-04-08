import { ComponentStory } from '@storybook/react';
import React, { CSSProperties, FC } from 'react';
import Colors from './colors.json';

interface ColorChipProps {
  backgroundColor: string;
  colorName: string;
}

const ColorChip: FC<ColorChipProps> = props => {
  const { backgroundColor, colorName } = props;
  const contrastingColor = getContrastingColor(backgroundColor);

  const colorChipStyle: CSSProperties = {
    fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    padding: '20px',
    backgroundColor,
    color: contrastingColor,
    border: `1px solid ${contrastingColor}`,
  };

  const colorChipValueStyle: CSSProperties = {
    fontWeight: 700,
    marginLeft: '4px',
  };

  return (
    <div style={colorChipStyle}>
      <span>{colorName}:</span>
      <span style={colorChipValueStyle}>{backgroundColor}</span>
    </div>
  );
};

const getContrastingColor = (colorHex: string): string => {
  const brightness = getBrightness(colorHex);
  return brightness > 125 ? '#222222' : '#FEFEFE';
};

const getBrightness = (colorHex: string): number => {
  const rbgValues = hexToRgb(colorHex);
  if (rbgValues) {
    const [red, green, blue] = rbgValues;

    const brightness = Math.round((red * 299 + green * 587 + blue * 114) / 1000);

    return brightness;
  }
  return 125;
};

const hexToRgb = (colorHex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorHex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
};

export default {
  title: 'Color Palette',
  component: ColorChip,
  argTypes: {},
};

const parentStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '3px',
  width: '50%',
};

const Template: ComponentStory<typeof ColorChip> = args => (
  <div style={parentStyle}>
    <ColorChip {...args} />
  </div>
);

export const PrimaryMain = Template.bind({});
PrimaryMain.args = {
  backgroundColor: Colors.primaryMain,
  colorName: 'PrimaryMain',
};

export const PrimaryLight = Template.bind({});
PrimaryLight.args = {
  backgroundColor: Colors.primaryLight,
  colorName: 'PrimaryLight',
};

export const PrimaryDark = Template.bind({});
PrimaryDark.args = {
  backgroundColor: Colors.primaryDark,
  colorName: 'PrimaryDark',
};

export const TextPrimary = Template.bind({});
TextPrimary.args = {
  backgroundColor: Colors.textPrimary,
  colorName: 'TextPrimary',
};

export const SecondaryRegular = Template.bind({});
SecondaryRegular.args = {
  backgroundColor: Colors.secondaryRegular,
  colorName: 'SecondaryRegular',
};

export const SecondaryLight = Template.bind({});
SecondaryLight.args = {
  backgroundColor: Colors.secondaryLight,
  colorName: 'SecondaryLight',
};

export const TextPrimaryInverted = Template.bind({});
TextPrimaryInverted.args = {
  backgroundColor: Colors.textPrimaryInverted,
  colorName: 'TextPrimaryInverted',
};

export const TextSuccess = Template.bind({});
TextSuccess.args = {
  backgroundColor: Colors.textSuccess,
  colorName: 'TextSuccess',
};

export const TextDisabled = Template.bind({});
TextDisabled.args = {
  backgroundColor: Colors.textDisabled,
  colorName: 'TextDisabled',
};

export const TextDisabledSecondary = Template.bind({});
TextDisabledSecondary.args = {
  backgroundColor: Colors.textDisabledSecondary,
  colorName: 'TextDisabledSecondary',
};

export const TextCaption = Template.bind({});
TextCaption.args = {
  backgroundColor: Colors.textCaption,
  colorName: 'TextCaption',
};

export const TextError = Template.bind({});
TextError.args = {
  backgroundColor: Colors.textError,
  colorName: 'TextError',
};

export const ToggleSwitchInactiveBackground = Template.bind({});
ToggleSwitchInactiveBackground.args = {
  backgroundColor: Colors.toggleSwitchInactiveBackground,
  colorName: 'ToggleSwitchInactiveBackground',
};

export const ToggleSwitchThumbInactiveBackground = Template.bind({});
ToggleSwitchThumbInactiveBackground.args = {
  backgroundColor: Colors.toggleSwitchThumbInactiveBackground,
  colorName: 'ToggleSwitchThumbInactiveBackground',
};

export const ToggleSwitchThumbInactiveBorder = Template.bind({});
ToggleSwitchThumbInactiveBorder.args = {
  backgroundColor: Colors.toggleSwitchThumbInactiveBorder,
  colorName: 'ToggleSwitchThumbInactiveBorder',
};

export const TabsBackground = Template.bind({});
TabsBackground.args = {
  backgroundColor: Colors.tabsBackground,
  colorName: 'TabsBackground',
};

export const TabsBorder = Template.bind({});
TabsBorder.args = {
  backgroundColor: Colors.tabsBorder,
  colorName: 'TabsBorder',
};

export const ButtonDefault = Template.bind({});
ButtonDefault.args = {
  backgroundColor: Colors.buttonDefault,
  colorName: 'ButtonDefault',
};

export const ButtonBorder = Template.bind({});
ButtonBorder.args = {
  backgroundColor: Colors.buttonBorder,
  colorName: 'ButtonBorder',
};

export const ButtonSuccess = Template.bind({});
ButtonSuccess.args = {
  backgroundColor: Colors.buttonSuccess,
  colorName: 'ButtonSuccess',
};

export const ButtonBorderSuccess = Template.bind({});
ButtonBorderSuccess.args = {
  backgroundColor: Colors.buttonBorderSuccess,
  colorName: 'ButtonBorderSuccess',
};

export const ButtonDisabled = Template.bind({});
ButtonDisabled.args = {
  backgroundColor: Colors.buttonDisabled,
  colorName: 'ButtonDisabled',
};

export const ButtonSecondaryHighlight = Template.bind({});
ButtonSecondaryHighlight.args = {
  backgroundColor: Colors.buttonSecondaryHighlight,
  colorName: 'ButtonSecondaryHighlight',
};

export const ButtonSecondaryLoading = Template.bind({});
ButtonSecondaryLoading.args = {
  backgroundColor: Colors.buttonSecondaryLoading,
  colorName: 'ButtonSecondaryLoading',
};

export const ButtonSecondaryDisabled = Template.bind({});
ButtonSecondaryDisabled.args = {
  backgroundColor: Colors.buttonSecondaryDisabled,
  colorName: 'ButtonSecondaryDisabled',
};

export const ButtonTertiaryDefault = Template.bind({});
ButtonTertiaryDefault.args = {
  backgroundColor: Colors.buttonTertiaryDefault,
  colorName: 'ButtonTertiaryDefault',
};

export const FormattedDateSeparatorLowContrast = Template.bind({});
FormattedDateSeparatorLowContrast.args = {
  backgroundColor: Colors.formattedDateSeparatorLowContrast,
  colorName: 'FormattedDateSeparatorLowContrast',
};

export const FormattedDateSeparatorHighContrast = Template.bind({});
FormattedDateSeparatorHighContrast.args = {
  backgroundColor: Colors.formattedDateSeparatorHighContrast,
  colorName: 'FormattedDateSeparatorHighContrast',
};

export const TermTabsBackground = Template.bind({});
TermTabsBackground.args = {
  backgroundColor: Colors.termTabsBackground,
  colorName: 'TermTabsBackground',
};

export const TermTabsBorder = Template.bind({});
TermTabsBorder.args = {
  backgroundColor: Colors.termTabsBorder,
  colorName: 'TermTabsBorder',
};

export const TermTabsSelectedBackground = Template.bind({});
TermTabsSelectedBackground.args = {
  backgroundColor: Colors.termTabsSelectedBackground,
  colorName: 'TermTabsSelectedBackground',
};

export const TermTabsSelectedBorder = Template.bind({});
TermTabsSelectedBorder.args = {
  backgroundColor: Colors.termTabsSelectedBorder,
  colorName: 'TermTabsSelectedBorder',
};

export const DropdownBackground = Template.bind({});
DropdownBackground.args = {
  backgroundColor: Colors.dropdownBackground,
  colorName: 'DropdownBackground',
};

export const DropdownBorder = Template.bind({});
DropdownBorder.args = {
  backgroundColor: Colors.dropdownBorder,
  colorName: 'DropdownBorder',
};

export const DropdownBackgroundHighlight = Template.bind({});
DropdownBackgroundHighlight.args = {
  backgroundColor: Colors.dropdownBackgroundHighlight,
  colorName: 'DropdownBackgroundHighlight',
};

export const DropdownBackgroundSelected = Template.bind({});
DropdownBackgroundSelected.args = {
  backgroundColor: Colors.dropdownBackgroundSelected,
  colorName: 'DropdownBackgroundSelected',
};

export const TextInputBackground = Template.bind({});
TextInputBackground.args = {
  backgroundColor: Colors.textInputBackground,
  colorName: 'TextInputBackground',
};

export const TextInputBorder = Template.bind({});
TextInputBorder.args = {
  backgroundColor: Colors.textInputBorder,
  colorName: 'TextInputBorder',
};

export const TextInputBackgroundDisabled = Template.bind({});
TextInputBackgroundDisabled.args = {
  backgroundColor: Colors.textInputBackgroundDisabled,
  colorName: 'TextInputBackgroundDisabled',
};

export const TextInputBorderDisabled = Template.bind({});
TextInputBorderDisabled.args = {
  backgroundColor: Colors.textInputBorderDisabled,
  colorName: 'TextInputBorderDisabled',
};

export const NumberInputMidBorderDisabled = Template.bind({});
NumberInputMidBorderDisabled.args = {
  backgroundColor: Colors.numberInputMidBorderDisabled,
  colorName: 'NumberInputMidBorderDisabled',
};

export const TableRowBorderColor = Template.bind({});
TableRowBorderColor.args = {
  backgroundColor: Colors.tableRowBorderColor,
  colorName: 'TableRowBorderColor',
};
