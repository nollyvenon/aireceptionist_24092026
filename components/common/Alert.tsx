import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, onClose }) => {
  const styles = {
    success: 'bg-accent-container text-on-surface border-accent',
    error: 'bg-error-container text-on-surface border-error',
    warning: 'bg-secondary-container text-on-surface border-secondary',
    info: 'bg-primary-container text-on-surface border-primary-600',
  };

  return (
    <div className={`${styles[type]} border-l-4 p-4 rounded-lg flex items-start justify-between`}>
      <div>
        {title && <h3 className="font-semibold">{title}</h3>}
        <p className={title ? 'mt-1' : ''}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-on-surface hover:text-on-surface-variant ml-2 flex-shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
};
