import React from 'react';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';

interface Props {
  links: {
    Twitter: string;
    Instagram: string;
    LinkedIn: string;
  };
  className?: string;
}

export const SocialLinks: React.FC<Props> = ({ links, className = '' }) => {
  // Helper function to check if a URL is valid and not a placeholder
  const isValidUrl = (url: string | undefined | null): boolean => {
    return !!(url && url.trim() !== '' && url !== '#');
  };

  const platforms = [
    { 
      url: links.Instagram, 
      Icon: IconBrandInstagram, 
      title: 'Instagram',
      activeColor: 'text-pink-500 hover:text-pink-400', // Instagram brand color
      inactiveColor: 'text-gray-500'
    },
    { 
      url: links.LinkedIn, 
      Icon: IconBrandLinkedin, 
      title: 'LinkedIn',
      activeColor: 'text-blue-600 hover:text-blue-500', // LinkedIn brand color
      inactiveColor: 'text-gray-500'
    },
    { 
      url: links.Twitter, 
      Icon: IconBrandX, 
      title: 'X (formerly Twitter)',
      activeColor: 'text-sky-400 hover:text-sky-300', // Twitter/X brand color
      inactiveColor: 'text-gray-500'
    }
  ];

  const handleIconClick = (url: string | undefined, title: string) => {
    if (isValidUrl(url)) {
      // Open the social media profile in external browser
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    // If no valid URL, do nothing (inactive state)
  };

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {platforms.map(({ url, Icon, title, activeColor, inactiveColor }) => {
        const isActive = isValidUrl(url);
        
        return (
          <button
            key={title}
            onClick={() => handleIconClick(url, title)}
            className={`
              transition-colors duration-200 
              ${isActive ? activeColor : inactiveColor}
              ${isActive ? 'cursor-pointer active:scale-95' : 'cursor-default'}
              ${isActive ? 'hover:scale-110' : ''}
              transform transition-transform
            `}
            title={isActive ? `Visit ${title} profile` : `${title} profile not linked`}
            disabled={!isActive}
            type="button"
          >
            <Icon 
              size={24} 
              className={`
                ${isActive ? 'drop-shadow-sm' : 'opacity-50'}
                transition-opacity duration-200
              `}
            />
          </button>
        );
      })}
    </div>
  );
};