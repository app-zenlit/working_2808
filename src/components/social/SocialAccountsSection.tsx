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

// NEW: Add ref interface for external access
export interface SocialAccountsSectionRef {
  openModal: () => void;
}

export const SocialAccountsSection = forwardRef<SocialAccountsSectionRef, Props>(({ user, onUserUpdate }, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // NEW: Expose method to open modal
  useImperativeHandle(ref, () => ({
    openModal: () => {
      console.log(`🔍 [SocialAccountsSection] Opening modal via ref`);
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

      {/* Connected Platforms Summary - Simple List */}
      {connectedCount > 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">Connected Accounts</h3>
          <div className="space-y-2">
            {socialProviders
              .filter(provider => provider.isConnected)
              .map((provider) => {
                const IconComponent = provider.icon;
                return (
                  <div key={provider.id} className="flex items-center gap-3">
                    <IconComponent size={18} className="text-gray-300 flex-shrink-0" />
                    <span className="text-sm text-white">{provider.name}</span>
                    <CheckCircleIcon className="w-4 h-4 text-green-500 ml-auto" />
                  </div>
                );
              })}
          </div>
          <button
            onClick={handleOpenModal}
            className="mt-3 text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            Edit connections
          </button>
        </div>
      )}

      {/* No connections state */}
      {connectedCount === 0 && (
        <div className="bg-gray-800/30 border border-gray-700 border-dashed rounded-lg p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex -space-x-2">
              <IconBrandInstagram size={20} className="text-gray-500" />
              <IconBrandLinkedin size={20} className="text-gray-500" />
              <IconBrandX size={20} className="text-gray-500" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-3">No social media accounts connected</p>
          <button
            onClick={handleOpenModal}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            Connect your first account
          </button>
        </div>
      )}

      {/* Social Links Modal */}
      <SocialLinksModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        user={user}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
});

SocialAccountsSection.displayName = 'SocialAccountsSection';