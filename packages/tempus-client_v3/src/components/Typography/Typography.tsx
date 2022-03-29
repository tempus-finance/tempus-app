import React, { CSSProperties, FC } from 'react';
import parse from 'html-react-parser';

type TypographyVariant =
  | 'header'
  | 'subheader'
  | 'title'
  | 'subtitle'
  | 'body-primary'
  | 'body-secondary'
  | 'boyd-tertiary';

type TypographyColor = 'text-primary';

type TypographyWeight = 'regular' | 'medium' | 'bold';

type TypographySpacing = 'regular' | 'mono';

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
typographyVariantMap.set('boyd-tertiary', {
  fontStyle: 'normal',
  fontSize: '10px',
  lineHeight: '16px',
});

const typographyColorMap = new Map<TypographyColor, string>();
typographyColorMap.set('text-primary', '#222222');

const typographyWeightMap = new Map<TypographyWeight, number>();
typographyWeightMap.set('regular', 400);
typographyWeightMap.set('medium', 500);
typographyWeightMap.set('bold', 700);

const typographySpacingMap = new Map<TypographySpacing, string>();
typographySpacingMap.set('regular', "'DM Sans', sans-serif");
typographySpacingMap.set('mono', "'Azeret Mono', monospace");

interface TypographyProps {
  variant: TypographyVariant;
  color?: TypographyColor;
  weight?: TypographyWeight;
  spacing?: TypographySpacing;
  html?: string;
}

const Typography: FC<TypographyProps & React.HTMLProps<HTMLDivElement>> = props => {
  const { variant, color, weight, spacing, html, children } = props;

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
  if (spacing) {
    fontFamily = typographySpacingMap.get(spacing);
  } else {
    fontFamily = typographySpacingMap.get('regular');
  }

  return (
    <div
      style={{
        ...typographyVariantMap.get(variant),
        color: fontColor,
        fontWeight: fontWeight,
        fontFamily: fontFamily,
      }}
    >
      {html ? parse(html) : children}
    </div>
  );
};
export default Typography;
