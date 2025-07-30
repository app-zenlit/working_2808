import React, { useState } from 'react';
import { User } from '../../types';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';
import { ChatBubbleLeftIcon, UserIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { UserProfileModal } from './UserProfileModal';

interface Props {
  user: User;
  onMessage: (user: User) => void;
  onViewProfile: () => void;
}

export const RadarUserCard: React.FC<Props> = ({ user, onMessage, onViewProfile }) => {
  const [showModal, setShowModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if bio is longer than approximately 2-3 lines (around 100 characters)
  const shouldTruncate = user.bio.length > 100;
  const displayBio = shouldTruncate && !isExpanded 
    ? user.bio.substring(0, 100) 
    : user.bio;

  // Helper function to check if a URL is valid and not a placeholder
  const isValidUrl = (url: string | undefined | null): boolean => {
    return !!(url && url.trim() !== '' && url !== '#');
  };

  return (
    <>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:border-gray-700">
        <div className="p-4">
          {/* Top section: Photo, Name, and Proximity Indicator */}
          <div className="flex items-start space-x-4 mb-3">
            <button 
              onClick={() => setShowModal(true)} 
              className="flex-shrink-0 active:scale-95 transition-transform"
            >
              <div className="relative">
                {user.dpUrl ? (
                  <img
                    src={user.dpUrl}
                    alt={user.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-blue-500">
                    <span className="text-gray-400 text-xs">No Photo</span>
                  </div>
                )}
                {/* Online indicator for users in same location bucket */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-white truncate">{user.name}</h3>

                </div>
                

              </div>
              
              {/* Bio section with smooth expansion */}
              <div className="text-gray-300 text-sm">
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-96' : 'max-h-12'
                  }`}
                >
                  <span className="leading-relaxed">{displayBio}</span>
                  {shouldTruncate && !isExpanded && <span>...</span>}
                </div>
                {shouldTruncate && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-400 hover:text-blue-300 text-xs mt-1 transition-colors"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom section: Social Links and Action Buttons */}
          <div className="flex items-center justify-between">
            {/* Social Links - Left side - Only show if URLs are valid */}
            <div className="flex gap-2">
              <SocialLinks 
                links={{
                  Instagram: user.instagramUrl || '',
                  LinkedIn: user.linkedInUrl || '',
                  Twitter: user.twitterUrl || '',
                  Google: '' // Add Google as empty for now
                }} 
              />
            </div>

            {/* Action Buttons - Right side */}
            <div className="flex gap-2">
              <button
                onClick={onViewProfile}
                className="bg-gray-700 text-white px-4 py-3 rounded-xl hover:bg-gray-600 active:scale-95 transition-all"
                title="View full profile"
              >
                <UserIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onMessage(user)}
                className="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 active:scale-95 transition-all"
                title="Send message (very close!)"
              >
                <ChatBubbleLeftIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <UserProfileModal
          user={user}
          onClose={() => setShowModal(false)}
          onViewProfile={() => {
            setShowModal(false);
            onViewProfile();
          }}
        />
      )}
    </>
  );
};