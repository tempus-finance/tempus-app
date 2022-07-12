import { ComponentStory } from '@storybook/react';
import { CSSProperties, FC } from 'react';
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
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})(?:[a-f\d]{2})?$/i.exec(colorHex);
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

export const PrimaryExtraLight = Template.bind({});
PrimaryExtraLight.args = {
  backgroundColor: Colors.primaryExtraLight,
  colorName: 'PrimaryExtraLight',
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

export const TextSecondary = Template.bind({});
TextSecondary.args = {
  backgroundColor: Colors.textSecondary,
  colorName: 'TextSecondary',
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

export const SuccessMain = Template.bind({});
SuccessMain.args = {
  backgroundColor: Colors.successMain,
  colorName: 'SuccessMain',
};

export const SuccessLight = Template.bind({});
SuccessLight.args = {
  backgroundColor: Colors.successLight,
  colorName: 'SuccessLight',
};

export const WarningMain = Template.bind({});
WarningMain.args = {
  backgroundColor: Colors.warningMain,
  colorName: 'WarningMain',
};

export const WarningLight = Template.bind({});
WarningLight.args = {
  backgroundColor: Colors.warningLight,
  colorName: 'WarningLight',
};

export const DangerMain = Template.bind({});
DangerMain.args = {
  backgroundColor: Colors.dangerMain,
  colorName: 'DangerMain',
};

export const DangerLight = Template.bind({});
DangerLight.args = {
  backgroundColor: Colors.dangerLight,
  colorName: 'DangerLight',
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

export const TermTabsDisabledBackground = Template.bind({});
TermTabsDisabledBackground.args = {
  backgroundColor: Colors.termTabsDisabledBackground,
  colorName: 'TermTabsDisabledBackground',
};

export const TermTabsDisabledBorder = Template.bind({});
TermTabsDisabledBorder.args = {
  backgroundColor: Colors.termTabsDisabledBorder,
  colorName: 'TermTabsDisabledBorder',
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

export const CurrencyInputBackground = Template.bind({});
CurrencyInputBackground.args = {
  backgroundColor: Colors.currencyInputBackground,
  colorName: 'CurrencyInputBackground',
};

export const CurrencyInputHoverBackground = Template.bind({});
CurrencyInputHoverBackground.args = {
  backgroundColor: Colors.currencyInputHoverBackground,
  colorName: 'CurrencyInputHoverBackground',
};

export const CurrencyInputDisabledBackground = Template.bind({});
CurrencyInputDisabledBackground.args = {
  backgroundColor: Colors.currencyInputDisabledBackground,
  colorName: 'CurrencyInputDisabledBackground',
};

export const CurrencyInputBorder = Template.bind({});
CurrencyInputBorder.args = {
  backgroundColor: Colors.currencyInputBorder,
  colorName: 'CurrencyInputBorder',
};

export const CurrencyInputDisabledBorder = Template.bind({});
CurrencyInputDisabledBorder.args = {
  backgroundColor: Colors.currencyInputDisabledBorder,
  colorName: 'CurrencyInputDisabledBorder',
};

export const PageContainerBackground = Template.bind({});
PageContainerBackground.args = {
  backgroundColor: Colors.pageContainerBackground,
  colorName: 'PageContainerBackground',
};

export const PoolCardBackground = Template.bind({});
PoolCardBackground.args = {
  backgroundColor: Colors.poolCardBackground,
  colorName: 'PoolCardBackground',
};

export const PoolCardBorder = Template.bind({});
PoolCardBorder.args = {
  backgroundColor: Colors.poolCardBorder,
  colorName: 'PoolCardBorder',
};

export const PoolCardFlagDisabledBorder = Template.bind({});
PoolCardFlagDisabledBorder.args = {
  backgroundColor: Colors.poolCardFlagDisabledBorder,
  colorName: 'PoolCardFlagDisabledBorder',
};

export const PoolCardFlagDisabledBackground = Template.bind({});
PoolCardFlagDisabledBackground.args = {
  backgroundColor: Colors.poolCardFlagDisabledBackground,
  colorName: 'PoolCardFlagDisabledBackground',
};

export const IconDefaultColor = Template.bind({});
IconDefaultColor.args = {
  backgroundColor: Colors.iconDefaultColor,
  colorName: 'IconDefaultColor',
};

export const IconButtonBackground = Template.bind({});
IconButtonBackground.args = {
  backgroundColor: Colors.iconButtonBackground,
  colorName: 'IconButtonBackground',
};
export const IconButtonBorder = Template.bind({});
IconButtonBorder.args = {
  backgroundColor: Colors.iconButtonBorder,
  colorName: 'IconButtonBorder',
};

export const IconButtonIcon = Template.bind({});
IconButtonIcon.args = {
  backgroundColor: Colors.iconButtonIcon,
  colorName: 'IconButtonIcon',
};

export const IconButtonSelectedBackground = Template.bind({});
IconButtonSelectedBackground.args = {
  backgroundColor: Colors.iconButtonSelectedBackground,
  colorName: 'IconButtonSelectedBackground',
};

export const IconButtonSelectedIcon = Template.bind({});
IconButtonSelectedIcon.args = {
  backgroundColor: Colors.iconButtonSelectedIcon,
  colorName: 'IconButtonSelectedIcon',
};

export const WalletButtonBorder = Template.bind({});
WalletButtonBorder.args = {
  backgroundColor: Colors.walletButtonBorder,
  colorName: 'WalletButtonBorder',
};

export const WalletButtonBackground = Template.bind({});
WalletButtonBackground.args = {
  backgroundColor: Colors.walletButtonBackground,
  colorName: 'WalletButtonBackground',
};

export const WalletButtonHover = Template.bind({});
WalletButtonHover.args = {
  backgroundColor: Colors.walletButtonHover,
  colorName: 'WalletButtonHover',
};

export const WalletPopupBackground = Template.bind({});
WalletPopupBackground.args = {
  backgroundColor: Colors.walletPopupBackground,
  colorName: 'WalletPopupBackground',
};

export const WalletPopupInnerBorder = Template.bind({});
WalletPopupInnerBorder.args = {
  backgroundColor: Colors.walletPopupInnerBorder,
  colorName: 'WalletPopupInnerBorder',
};

export const SwitcherButtonBorder = Template.bind({});
SwitcherButtonBorder.args = {
  backgroundColor: Colors.switcherButtonBorder,
  colorName: 'SwitcherButtonBorder',
};

export const SwitcherButtonBackground = Template.bind({});
SwitcherButtonBackground.args = {
  backgroundColor: Colors.switcherButtonBackground,
  colorName: 'SwitcherButtonBackground',
};

export const ModalBackground = Template.bind({});
ModalBackground.args = {
  backgroundColor: Colors.modalBackground,
  colorName: 'ModalBackground',
};

export const ModalBackgroundShade = Template.bind({});
ModalBackgroundShade.args = {
  backgroundColor: Colors.modalBackgroundShade,
  colorName: 'ModalBackgroundShade',
};

export const ModalBorder = Template.bind({});
ModalBorder.args = {
  backgroundColor: Colors.modalBorder,
  colorName: 'ModalBorder',
};

export const ModalBackdrop = Template.bind({});
ModalBackdrop.args = {
  backgroundColor: Colors.modalBackdrop,
  colorName: 'ModalBackdrop',
};

export const TooltipBorder = Template.bind({});
TooltipBorder.args = {
  backgroundColor: Colors.tooltipBorder,
  colorName: 'TooltipBorder',
};

export const TooltipBackground = Template.bind({});
TooltipBackground.args = {
  backgroundColor: Colors.tooltipBackground,
  colorName: 'TooltipBackground',
};

export const ProgressBarBackground = Template.bind({});
ProgressBarBackground.args = {
  backgroundColor: Colors.progressBarBackground,
  colorName: 'ProgressBarBackground',
};

export const ProgressBarBorder = Template.bind({});
ProgressBarBorder.args = {
  backgroundColor: Colors.progressBarBorder,
  colorName: 'ProgressBarBorder',
};

export const ProgressBarProgressBackground = Template.bind({});
ProgressBarProgressBackground.args = {
  backgroundColor: Colors.progressBarProgressBackground,
  colorName: 'ProgressBarProgressBackground',
};

export const DepositModalHeaderBackground = Template.bind({});
DepositModalHeaderBackground.args = {
  backgroundColor: Colors.depositModalHeaderBackground,
  colorName: 'DepositModalHeaderBackground',
};

export const ChartArea = Template.bind({});
ChartArea.args = {
  backgroundColor: Colors.chartArea,
  colorName: 'ChartArea',
};

export const ChartStroke = Template.bind({});
ChartStroke.args = {
  backgroundColor: Colors.chartStroke,
  colorName: 'ChartStroke',
};

export const ChartGrid = Template.bind({});
ChartGrid.args = {
  backgroundColor: Colors.chartGrid,
  colorName: 'ChartGrid',
};

export const ChartTooltipLine = Template.bind({});
ChartTooltipLine.args = {
  backgroundColor: Colors.chartTooltipLine,
  colorName: 'ChartTooltipLine',
};

export const ChartDotDominant = Template.bind({});
ChartDotDominant.args = {
  backgroundColor: Colors.chartDotDominant,
  colorName: 'ChartDotDominant',
};

export const ChartDotNeutral = Template.bind({});
ChartDotNeutral.args = {
  backgroundColor: Colors.chartDotNeutral,
  colorName: 'ChartDotNeutral',
};

export const PortfolioBoxBorder = Template.bind({});
PortfolioBoxBorder.args = {
  backgroundColor: Colors.portfolioBoxBorder,
  colorName: 'PortfolioBoxBorder',
};

export const PoolsHeadingOverlay = Template.bind({});
PoolsHeadingOverlay.args = {
  backgroundColor: Colors.poolsHeadingOverlay,
  colorName: 'PoolsHeadingOverlay',
};

export const PoolPositionCardBorder = Template.bind({});
PoolPositionCardBorder.args = {
  backgroundColor: Colors.poolPositionCardBorder,
  colorName: 'PoolPositionCardBorder',
};

export const PoolPositionCardBackground = Template.bind({});
PoolPositionCardBackground.args = {
  backgroundColor: Colors.poolPositionCardBackground,
  colorName: 'PoolPositionCardBackground',
};

export const LoadingPlaceholderBase = Template.bind({});
LoadingPlaceholderBase.args = {
  backgroundColor: Colors.loadingPlaceholderBase,
  colorName: 'LoadingPlaceholderBase',
};

export const LoadingPlaceholderShine = Template.bind({});
LoadingPlaceholderShine.args = {
  backgroundColor: Colors.loadingPlaceholderShine,
  colorName: 'LoadingPlaceholderShine',
};

export const LoadingPlaceholderOverlay = Template.bind({});
LoadingPlaceholderOverlay.args = {
  backgroundColor: Colors.loadingPlaceholderOverlay,
  colorName: 'LoadingPlaceholderOverlay',
};

export const MarketsFooterBackground = Template.bind({});
MarketsFooterBackground.args = {
  backgroundColor: Colors.marketsFooterBackground,
  colorName: 'MarketsFooterBackground',
};

export const MarketsFooterSeparator = Template.bind({});
MarketsFooterSeparator.args = {
  backgroundColor: Colors.marketsFooterSeparator,
  colorName: 'MarketsFooterSeparator',
};
