import React from 'react';
import './Card.css';

export type CardVariant = 'default' | 'outlined' | 'elevated';

interface CardProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className = '',
  children,
  onClick
}) => {
  const classNames = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    hoverable && 'card-hoverable',
    onClick && 'card-clickable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
