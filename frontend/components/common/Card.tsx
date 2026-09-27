import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-surface-container rounded-2xl border border-outline-variant
          shadow-sm transition-shadow hover:shadow-md
          ${className}
        `}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
