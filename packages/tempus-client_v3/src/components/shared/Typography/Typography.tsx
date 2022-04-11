import React, { CSSProperties, FC } from 'react';
import parse from 'html-react-parser';
import { colors } from '../Colors';

export type TypographyVariant =
  | 'header'
  | 'subheader'
  | 'title'
  | 'subtitle'
  | 'body-primary'
  | 'body-secondary'
  | 'body-tertiary';

export type TypographyColor =
  | 'text-primary'
  | 'text-secondary'
  | 'primary-dark'
  | 'text-primary-inverted'
  | 'text-success'
  | 'text-disabled'
  | 'text-disabled-secondary'
  | 'text-caption'
  | 'text-error';

export type TypographyWeight = 'regular' | 'medium' | 'bold';

type TypographyType = 'regular' | 'mono';

const typographyVariantMap = new Map<TypographyVariant, CSSProperties>();
typographyVariantMap.set('header', {
  fontStyle: 'normal',
  fontSize: '40px',
  lineHeight: '48px',
});
typographyVariantMap.set('subheader', {
  fontStyle: 'normal',
  fontSize: '32px',
  lineHeight: '40px',
});
typographyVariantMap.set('title', {
  fontStyle: 'normal',
  fontSize: '24px',
  lineHeight: '32px',
});
typographyVariantMap.set('subtitle', {
  fontStyle: 'normal',
  fontSize: '20px',
  lineHeight: '28px',
});
typographyVariantMap.set('body-primary', {
  fontStyle: 'normal',
  fontSize: '16px',
  lineHeight: '24px',
});
typographyVariantMap.set('body-secondary', {
  fontStyle: 'normal',
  fontSize: '12px',
  lineHeight: '16px',
});
typographyVariantMap.set('body-tertiary', {
  fontStyle: 'normal',
  fontSize: '10px',
  lineHeight: '16px',
});

const typographyColorMap = new Map<TypographyColor, string>();
typographyColorMap.set('text-primary', colors.textPrimary);
typographyColorMap.set('text-secondary', colors.textSecondary);
typographyColorMap.set('primary-dark', colors.primaryDark);
typographyColorMap.set('text-primary-inverted', colors.textPrimaryInverted);
typographyColorMap.set('text-success', colors.textSuccess);
typographyColorMap.set('text-disabled', colors.textDisabled);
typographyColorMap.set('text-disabled-secondary', colors.textDisabledSecondary);
typographyColorMap.set('text-caption', colors.textCaption);
typographyColorMap.set('text-error', colors.textError);

const typographyWeightMap = new Map<TypographyWeight, number>();
typographyWeightMap.set('regular', 400);
typographyWeightMap.set('medium', 500);
typographyWeightMap.set('bold', 700);

const typographyTypeMap = new Map<TypographyType, string>();
typographyTypeMap.set('regular', "'DM Sans', sans-serif");
typographyTypeMap.set('mono', "'Azeret Mono', monospace");

interface TypographyProps {
  variant: TypographyVariant;
  color?: TypographyColor;
  opacity?: number;
  weight?: TypographyWeight;
  type?: TypographyType;
  html?: string;
  className?: string;
}

const Typography: FC<TypographyProps> = props => {
  const { variant, color, weight, opacity = 1, type, html, children, className } = props;

  let fontColor: string | undefined;
  if (color) {
    fontColor = typographyColorMap.get(color);
  } else {
    fontColor = typographyColorMap.get('text-primary');
  }

  let fontWeight: number | undefined;
  if (weight) {
    fontWeight = typographyWeightMap.get(weight);
  } else {
    fontWeight = typographyWeightMap.get('regular');
  }

  let fontFamily: string | undefined;
  if (type) {
    fontFamily = typographyTypeMap.get(type);
  } else {
    fontFamily = typographyTypeMap.get('regular');
  }

  return (
    <div
      className={className}
      style={{
        ...typographyVariantMap.get(variant),
        color: fontColor,
        fontWeight,
        fontFamily,
        opacity,
      }}
    >
      {html ? parse(html) : children}
    </div>
  );
};
export default Typography;
