import React from 'react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GradientLogo: React.FC<Props> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl text-6xl'
  };

  return (
    <span 
      className={`
        bg-gradient-to-r from-blue-600 to-purple-700
        bg-clip-text text-transparent
        font-medium font-sans
        ${sizeClasses[size]}
        ${className}
      `}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      Zenlit
    </span>
  );
};