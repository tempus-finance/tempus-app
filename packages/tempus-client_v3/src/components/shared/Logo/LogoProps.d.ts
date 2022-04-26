export default interface LogoProps {
  size?: 'large' | 'medium' | 'small' | number;
}

export interface InnerLogoProps extends Required<LogoProps> {}
