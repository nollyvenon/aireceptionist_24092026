import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  circle = false,
}) => {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        bg-surface-container-high animate-pulse
        ${circle ? 'rounded-full' : 'rounded-lg'}
        ${className}
      `}
      style={{
        width: widthStyle,
        height: heightStyle,
      }}
    />
  );
};
