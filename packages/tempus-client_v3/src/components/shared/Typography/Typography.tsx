import React, { CSSProperties, FC } from 'react';
import parse from 'html-react-parser';
import { colors } from '../Color';

type TypographyVariant =
  | 'header'
  | 'subheader'
  | 'title'
  | 'subtitle'
  | 'body-primary'
  | 'body-secondary'
  | 'body-tertiary';

export type TypographyColor =
  | 'text-primary'
  | 'text-inverted'
  | 'text-success'
  | 'text-disabled'
  | 'text-disabled-secondary';

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
typographyColorMap.set('text-inverted', colors.textInverted);
typographyColorMap.set('text-success', colors.textSuccess);
typographyColorMap.set('text-disabled', colors.textDisabled);
typographyColorMap.set('text-disabled-secondary', colors.textDisabledSecondary);

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
}

const Typography: FC<TypographyProps & React.HTMLProps<HTMLDivElement>> = props => {
  const { variant, color, weight, opacity = 1, type, html, children } = props;

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
      style={{
        ...typographyVariantMap.get(variant),
        color: fontColor,
        fontWeight: fontWeight,
        fontFamily: fontFamily,
        opacity,
      }}
    >
      {html ? parse(html) : children}
    </div>
  );
};
export default Typography;
