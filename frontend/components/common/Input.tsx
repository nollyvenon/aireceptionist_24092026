import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-on-surface mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg
            border-2 transition-colors
            bg-surface-container-lowest text-on-surface
            placeholder-on-surface-variant
            focus:outline-none focus:ring-0
            ${error ? 'border-error' : 'border-outline-variant focus:border-primary-600'}
            disabled:bg-surface-container disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-error mt-1.5">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-on-surface-variant mt-1.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
