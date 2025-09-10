import Image from 'next/image';
import React from 'react';
import { getRandomIcon, isValidProfilePhotoUrl } from '../../utils/avatarUtils';

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

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Don't render image if src is null, empty, or a placeholder
  if (!isValidProfilePhotoUrl(src)) {
    const IconComponent = getRandomIcon(alt);
    
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
          hover:bg-gray-600 transition-colors
        `}
        onClick={onClick}
      >
        <IconComponent className={`${iconSizes[size]} text-gray-400`} />
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