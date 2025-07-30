import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { User } from '../../types';
import { SocialLinksModal } from './SocialLinksModal';
import { 
  IconBrandInstagram, 
  IconBrandLinkedin, 
  IconBrandX
} from '@tabler/icons-react';
import { PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

// Add ref interface for external access
export interface SocialAccountsSectionRef {
  openModal: () => void;
  openPlatformModal: (platformId: string) => void;
}

export const SocialAccountsSection = forwardRef<SocialAccountsSectionRef, Props>(({ user, onUserUpdate }, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [platformToFocus, setPlatformToFocus] = useState<string | null>(null);

  console.log(`🔍 [SocialAccountsSection] Component rendered with user:`, {
    id: user.id,
    name: user.name,
    instagramUrl: user.instagramUrl,
    linkedInUrl: user.linkedInUrl,
    twitterUrl: user.twitterUrl
  });

  const socialProviders = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: IconBrandInstagram,
      url: user.instagramUrl,
      isConnected: !!user.instagramUrl
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: IconBrandLinkedin,
      url: user.linkedInUrl,
      isConnected: !!user.linkedInUrl
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: IconBrandX,
      url: user.twitterUrl,
      isConnected: !!user.twitterUrl
    }
  ];

  const connectedCount = socialProviders.filter(p => p.isConnected).length;

  // Expose methods to open modal
  useImperativeHandle(ref, () => ({
    openModal: () => {
      console.log(`🔍 [SocialAccountsSection] Opening modal via ref`);
      setIsModalOpen(true);
    },
    openPlatformModal: (platformId: string) => {
      console.log(`🔍 [SocialAccountsSection] Opening modal for platform: ${platformId}`);
      setPlatformToFocus(platformId);
      setIsModalOpen(true);
    }
  }));

  const handleOpenModal = () => {
    console.log(`🔍 [SocialAccountsSection] Opening modal via button click`);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log(`🔍 [SocialAccountsSection] Closing modal`);
    setIsModalOpen(false);
    setPlatformToFocus(null);
  };

  const handleUserUpdate = (updatedUser: User) => {
    console.log(`🔍 [SocialAccountsSection] User updated:`, {
      id: updatedUser.id,
      instagramUrl: updatedUser.instagramUrl,
      linkedInUrl: updatedUser.linkedInUrl,
      twitterUrl: updatedUser.twitterUrl
    });
    onUserUpdate(updatedUser);
  };

  const handleFocusHandled = () => {
    setPlatformToFocus(null);
  };
  return (
    <div className="space-y-6">
      {/* Header with Add Links Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Social Media Links</h2>
          <p className="text-sm text-gray-400 mt-1">
            {connectedCount} of {socialProviders.length} added
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add Links
        </button>
      </div>
      
      <p className="text-sm text-gray-400">
        Add links to your social media profiles to help others connect with you and build trust.
      </p>

      {/* Connected Platforms Display */}
      <div className="space-y-3">
        {socialProviders.map((provider) => {
          const IconComponent = provider.icon;

          return (
            <div key={provider.id} className="flex items-center justify-between p-4 bg-gray-800 border border-gray-600 rounded-lg">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <IconComponent size={24} className="text-gray-300 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white text-sm">{provider.name}</h3>
                    {provider.isConnected && (
                      <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {provider.isConnected ? 'Connected' : 'Not connected'}
                  </p>
                  {provider.isConnected && provider.url && (
                    <p className="text-xs text-blue-400 truncate mt-1">
                      {provider.url}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleOpenModal}
                className="px-3 py-2 rounded-lg font-medium text-white transition-all active:scale-95 text-xs flex-shrink-0 ml-3 bg-gray-700 hover:bg-gray-600"
              >
                {provider.isConnected ? 'Edit' : 'Add'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Social Links Modal */}
      <SocialLinksModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={user}
        onUserUpdate={handleUserUpdate}
        platformToFocus={platformToFocus}
        onFocusHandled={handleFocusHandled}
      />
    </div>
  );
});

SocialAccountsSection.displayName = 'SocialAccountsSection';