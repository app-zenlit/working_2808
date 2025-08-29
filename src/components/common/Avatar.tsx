import Image from 'next/image';
import React from 'react';

interface Props {
  src: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Avatar: React.FC<Props> = ({
  src,
  alt,
  size = 'md',
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // Don't render image if src is null
  if (!src) {
    return (
      <div 
        className={`
          ${sizeClasses[size]}
          rounded-full
          bg-gray-700
          flex items-center justify-center
          cursor-pointer
          ring-2
          ring-blue-500
          border-4 border-black
        `}
        onClick={onClick}
      >
        <span className="text-gray-400 text-xs">No Photo</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <Image
        src={src}
        alt={alt}
        width={size === 'sm' ? 40 : size === 'md' ? 48 : 64}
        height={size === 'sm' ? 40 : size === 'md' ? 48 : 64}
        className={`
          ${sizeClasses[size]}
          rounded-full
          object-cover
          cursor-pointer
          ring-2
          ring-blue-500
          border-4 border-black
        `}
        onClick={onClick}
      />
    </div>
  );
};