import React from 'react';
import './Typography.css';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
export type TypographyColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success';

interface TypographyProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'primary',
  align = 'left',
  weight,
  className = '',
  children,
  as
}) => {
  const Component = as || getDefaultComponent(variant);
  
  const classNames = [
    'typography',
    `typography-${variant}`,
    `typography-color-${color}`,
    `typography-align-${align}`,
    weight && `typography-weight-${weight}`,
    className
  ].filter(Boolean).join(' ');

  return <Component className={classNames}>{children}</Component>;
};

const getDefaultComponent = (variant: TypographyVariant): keyof JSX.IntrinsicElements => {
  const map: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body1: 'p',
    body2: 'p',
    caption: 'span',
    overline: 'span'
  };
  return map[variant];
};

export default Typography;
