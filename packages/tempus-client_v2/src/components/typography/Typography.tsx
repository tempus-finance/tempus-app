import React, { CSSProperties, FC, memo } from 'react';
import parse from 'html-react-parser';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'sub-title'
  | 'body-text'
  | 'breadcrumbs'
  | 'disclaimer-text'
  | 'button-text'
  | 'dropdown-text'
  | 'card-title'
  | 'card-body-text'
  | 'tooltip-card-title'
  | 'tooltip-card-text'
  | 'tooltip-card-text-bold'
  | 'fractional'
  | 'yield-card-header'
  | 'yield-card-type'
  | 'chain-badge'
  | 'wallet-info'
  | 'wallet-info-bold'
  | 'contract-addr'
  | 'dash-maturity-label'
  | 'dash-maturity-date'
  | 'dash-maturity-date-bold'
  | 'matured-dash-label';

type TypographyColor =
  | 'default'
  | 'primary'
  | 'accent'
  | 'inverted'
  | 'link'
  | 'title'
  | 'error'
  | 'success'
  | 'label-gray';

const typographyStyleMap = new Map<TypographyVariant, CSSProperties>();
typographyStyleMap.set('h1', {
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 600,
  fontSize: '22px',
  fontStyle: 'normal',
  lineHeight: '30px',
});
typographyStyleMap.set('h2', {
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 600,
  fontSize: '18px',
  fontStyle: 'normal',
  lineHeight: '25px',
});
typographyStyleMap.set('h3', {
  fontFamily: "'Source Sans Pro', sans-serif;",
  fontWeight: 500,
  fontSize: '22px',
  fontStyle: 'normal',
  lineHeight: '26px',
});
typographyStyleMap.set('h4', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 700,
  fontSize: '18px',
  fontStyle: 'normal',
  lineHeight: '21px',
});
typographyStyleMap.set('h5', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 500,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '19px',
});
typographyStyleMap.set('sub-title', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 600,
  fontSize: '12px',
  fontStyle: 'normal',
  lineHeight: '15px',
});
typographyStyleMap.set('body-text', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 400,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '19px',
});
typographyStyleMap.set('breadcrumbs', {
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 500,
  fontSize: '10px',
  fontStyle: 'normal',
  lineHeight: '16px',
});
typographyStyleMap.set('disclaimer-text', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 400,
  fontSize: '12px',
  fontStyle: 'normal',
  lineHeight: '14px',
});
typographyStyleMap.set('button-text', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 600,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '20px',
});
typographyStyleMap.set('dropdown-text', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 400,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '20px',
});
typographyStyleMap.set('card-title', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 400,
  fontSize: '22px',
  fontStyle: 'normal',
  lineHeight: '30px',
});
typographyStyleMap.set('card-body-text', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 400,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '20px',
});
typographyStyleMap.set('tooltip-card-title', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 700,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '24px',
});
typographyStyleMap.set('tooltip-card-text', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 400,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '22px',
});
typographyStyleMap.set('tooltip-card-text-bold', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 500,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '24px',
});
typographyStyleMap.set('fractional', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 400,
  fontSize: '14px',
  fontStyle: 'normal',
  lineHeight: '17.6px',
});
typographyStyleMap.set('yield-card-header', {
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 400,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '22px',
});
typographyStyleMap.set('yield-card-type', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 700,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '20px',
});
typographyStyleMap.set('chain-badge', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 600,
  fontSize: '12px',
  fontStyle: 'normal',
  lineHeight: '16px',
});
typographyStyleMap.set('wallet-info', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 400,
  fontSize: '12px',
  fontStyle: 'normal',
  lineHeight: '16px',
});
typographyStyleMap.set('wallet-info-bold', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 700,
  fontSize: '12px',
  fontStyle: 'normal',
  lineHeight: '16px',
});
typographyStyleMap.set('contract-addr', {
  fontFamily: "'Source Sans Pro', Mono, sans-serif",
  fontWeight: 400,
  fontSize: '12px',
  fontStyle: 'normal',
  lineHeight: '16px',
});
typographyStyleMap.set('dash-maturity-label', {
  fontFamily: "'Source Sans Pro', Mono, sans-serif",
  fontWeight: 600,
  fontSize: '12px',
  fontStyle: 'normal',
  lineHeight: '16px',
});
typographyStyleMap.set('dash-maturity-date', {
  fontFamily: "'Source Sans Pro', Mono, sans-serif",
  fontWeight: 400,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '24px',
});
typographyStyleMap.set('dash-maturity-date-bold', {
  fontFamily: "'Source Sans Pro', Mono, sans-serif",
  fontWeight: 600,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '24px',
});
typographyStyleMap.set('matured-dash-label', {
  fontFamily: "'Source Sans Pro', Mono, sans-serif",
  fontWeight: 600,
  fontSize: '10px',
  fontStyle: 'normal',
  lineHeight: '16px',
});

interface TypographyProps {
  variant: TypographyVariant;
  color?: TypographyColor;
  capitalize?: boolean;
  html?: string;
  align?: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent';
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line' | 'break-spaces' | 'inherit' | 'initial' | 'revert';
}

const Typography: FC<TypographyProps & React.HTMLProps<HTMLDivElement>> = props => {
  const { variant, color, capitalize, html, align, whiteSpace, children, ...divProps } = props;

  let colorStyle: string;
  switch (color) {
    case 'default':
      colorStyle = '#222222';
      break;
    case 'primary':
      colorStyle = '#288195';
      break;
    case 'accent':
      colorStyle = '#FF6B00';
      break;
    case 'inverted':
      colorStyle = '#FFFFFF';
      break;
    case 'link':
      colorStyle = '#288195';
      break;
    case 'title':
      colorStyle = '#7A7A7A';
      break;
    case 'error':
      colorStyle = '#FF0F0F';
      break;
    case 'success':
      colorStyle = '#4BB543';
      break;
    case 'label-gray':
      colorStyle = '#474350';
      break;
    default:
      colorStyle = '#222222';
  }

  return (
    <div
      data-variant={variant}
      style={{
        ...typographyStyleMap.get(variant),
        color: colorStyle,
        textTransform: capitalize ? 'capitalize' : 'none',
        textAlign: align ? align : 'unset',
        whiteSpace: whiteSpace ? whiteSpace : 'unset',
      }}
      {...divProps}
    >
      {html ? parse(html) : children}
    </div>
  );
};
export default memo(Typography);
