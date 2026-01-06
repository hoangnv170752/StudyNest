import React, { forwardRef } from 'react';
import './Input.css';

export type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  inputSize?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  inputSize = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const wrapperClasses = [
    'input-wrapper',
    fullWidth && 'input-full-width',
    disabled && 'input-disabled'
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'input',
    `input-${inputSize}`,
    error && 'input-error',
    leftIcon && 'input-with-left-icon',
    rightIcon && 'input-with-right-icon',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      <div className="input-container">
        {leftIcon && <span className="input-icon input-icon-left">{leftIcon}</span>}
        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled}
          {...props}
        />
        {rightIcon && <span className="input-icon input-icon-right">{rightIcon}</span>}
      </div>
      {(error || helperText) && (
        <span className={error ? 'input-error-text' : 'input-helper-text'}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
