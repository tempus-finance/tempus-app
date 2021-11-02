import { CSSProperties, FC } from 'react';

type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'body-text'
  | 'disclaimer-text'
  | 'button-text'
  | 'dropdown-text'
  | 'card-title'
  | 'card-body-text';
type TypographyColor = 'default' | 'accent' | 'inverted' | 'link' | 'title' | 'error' | 'success';

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
typographyStyleMap.set('body-text', {
  fontFamily: "'Source Sans Pro', sans-serif",
  fontWeight: 400,
  fontSize: '16px',
  fontStyle: 'normal',
  lineHeight: '19px',
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
      color = '#288195';
      break;
    case 'title':
      color = '#7A7A7A';
      break;
    case 'error':
      color = '#FF0F0F';
      break;
    case 'success':
      color = '#4BB543';
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
        textAlign: props.align ? props.align : 'unset',
      }}
    >
      {props.children}
    </div>
  );
};
export default Typography;
