import { CSSProperties, FC } from 'react';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body-text' | 'disclaimer-text';
type TypographyColor = 'default' | 'accent' | 'inverted' | 'link';

const typographyStyleMap = new Map<TypographyVariant, CSSProperties>();
typographyStyleMap.set('h1', {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 900,
  fontSize: '36px',
  fontStyle: 'normal',
  lineHeight: '44px',
});
typographyStyleMap.set('h2', {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 900,
  fontSize: '26px',
  fontStyle: 'normal',
  lineHeight: '31px',
});
typographyStyleMap.set('h3', {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 500,
  fontSize: '22px',
  fontStyle: 'normal',
  lineHeight: '26px',
});
typographyStyleMap.set('h4', {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 700,
  fontSize: '18px',
  fontStyle: 'normal',
  lineHeight: '21px',
});
typographyStyleMap.set('h5', {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 500,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '19px',
});
typographyStyleMap.set('body-text', {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 400,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '19px',
});
typographyStyleMap.set('disclaimer-text', {
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 400,
  fontSize: '12px',
  fontStyle: 'normal',
  lineHeight: '14px',
});

interface TypographyProps {
  variant: TypographyVariant;
  color?: TypographyColor;
  capitalize?: boolean;
  align?: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent';
}

const Typography: FC<TypographyProps> = props => {
  let color: string;
  switch (props.color) {
    case 'default':
      color = '#222222';
      break;
    case 'accent':
      color = '#FF6B00';
      break;
    case 'inverted':
      color = '#FFFFFF';
      break;
    case 'link':
      color = '#047295';
      break;
    default:
      color = '#222222';
  }

  return (
    <div
      style={{
        ...typographyStyleMap.get(props.variant),
        color: color,
        textTransform: props.capitalize ? 'capitalize' : 'none',
        textAlign: props.align ? props.align : 'left',
      }}
    >
      {props.children}
    </div>
  );
};
export default Typography;
