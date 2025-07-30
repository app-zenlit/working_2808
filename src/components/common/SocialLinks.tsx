import React from 'react';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX, IconBrandGoogle } from '@tabler/icons-react';

interface Props {
  links: {
    Twitter: string;
    Instagram: string;
    LinkedIn: string;
  };
  className?: string;
  onPlatformClick?: (platform: string) => void;
}

export const SocialLinks: React.FC<Props> = ({ links, className = '', onPlatformClick }) => {
  // Helper function to check if a URL is valid and not a placeholder
  const isValidUrl = (url: string | undefined | null): boolean => {
    return !!(url && url.trim() !== '' && url !== '#');
  };

  const platforms = [
    { 
      id: 'instagram',
      url: links.Instagram, 
      Icon: IconBrandInstagram, 
      title: 'Instagram',
      activeColor: 'text-pink-500 hover:text-pink-400'
    },
    { 
      id: 'linkedin',
      url: links.LinkedIn, 
      Icon: IconBrandLinkedin, 
      title: 'LinkedIn',
      activeColor: 'text-blue-500 hover:text-blue-400'
    },
    { 
      id: 'twitter',
      url: links.Twitter, 
      Icon: IconBrandX, 
      title: 'X (formerly Twitter)',
      activeColor: 'text-gray-300 hover:text-white'
    },
  ];

  const handleIconClick = (url: string | undefined, title: string, platformId: string) => {
    if (isValidUrl(url)) {
      // Open the social media profile in external browser
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // If no valid URL and onPlatformClick is provided, trigger edit mode
      if (onPlatformClick) {
        onPlatformClick(platformId);
      }
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {platforms.map(({ id, url, Icon, title, activeColor }) => {
        const isActive = isValidUrl(url);
        
        return (
          <button
            key={title}
            onClick={() => handleIconClick(url, title, id)}
            className={`
              w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center
              transition-colors duration-200 
              ${isActive ? activeColor : 'text-gray-500 hover:text-gray-400'}
              cursor-pointer active:scale-95
              hover:bg-gray-700
              transform transition-transform
            `}
            title={isActive ? `Visit ${title} profile` : `Add ${title} profile`}
            type="button"
          >
            <Icon 
              size={18} 
              className="drop-shadow-sm transition-opacity duration-200"
            />
          </button>
        );
      })}
    </div>
  );
};