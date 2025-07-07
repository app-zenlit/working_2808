'use client'

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
  const platforms = [
    { url: links.Twitter, Icon: IconBrandX, title: 'X (formerly Twitter)' },
    { url: links.Instagram, Icon: IconBrandInstagram, title: 'Instagram' },
    { url: links.LinkedIn, Icon: IconBrandLinkedin, title: 'LinkedIn' }
  ]

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {platforms.map(
        ({ url, Icon, title }) =>
          url &&
          url.trim() !== '' &&
          url !== '#' && (
            <a
              key={title}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              title={title}
            >
              <Icon size={24} />
            </a>
          )
      )}
    </div>
  )
}
