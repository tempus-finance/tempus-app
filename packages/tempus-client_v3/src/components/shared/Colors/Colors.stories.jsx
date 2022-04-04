import React from 'react';
import Colors from './colors.json';

const ColorChip = props => {
  const { backgroundColor, colorName } = props;
  const contrastingColor = getContrastingColor(backgroundColor);

  const colorChipStyle = {
    fontFamily: "'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    padding: '20px',
    backgroundColor,
    color: contrastingColor,
    border: `1px solid ${contrastingColor}`,
  };

  const colorChipValueStyle = {
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

const getContrastingColor = hex => {
  const brightness = getBrightness(hex);
  return brightness > 125 ? '#222222' : '#FEFEFE';
};

const getBrightness = hex => {
  const rbgValues = hexToRgb(hex);
  if (rbgValues) {
    const [red, green, blue] = rbgValues;

    const brightness = Math.round((red * 299 + green * 587 + blue * 114) / 1000);

    return brightness;
  }
  return 125;
};

const hexToRgb = hex => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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

const Template = args => (
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
