export default interface IconProps {
  size?: 'large' | 'medium' | 'small' | 'tiny' | number;
  color?: string;
}

export interface InnerIconProps extends Required<IconProps> {}
