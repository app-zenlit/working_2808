import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { User, SocialProvider } from '../../types';
import { SocialLinkModal } from './SocialLinkModal';
import { 
  IconBrandInstagram, 
  IconBrandLinkedin, 
  IconBrandX
} from '@tabler/icons-react';
import { LinkIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { transformProfileToUser } from '../../../lib/utils';

interface Props {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

// NEW: Add ref interface for external access
export interface SocialAccountsSectionRef {
  openPlatformModal: (platformId: string) => void;
}

export const SocialAccountsSection = forwardRef<SocialAccountsSectionRef, Props>(({ user, onUserUpdate }, ref) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log(`🔍 [SocialAccountsSection] Component rendered with user:`, {
    id: user.id,
    name: user.name,
    instagramUrl: user.instagramUrl,
    linkedInUrl: user.linkedInUrl,
    twitterUrl: user.twitterUrl
  });

  const socialProviders: (SocialProvider & { 
    placeholder: string;
    getCurrentUrl: () => string | undefined;
    getIsVerified: () => boolean;
  })[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      color: 'pink',
      icon: IconBrandInstagram,
      placeholder: 'https://instagram.com/yourusername',
      getCurrentUrl: () => user.instagramUrl,
      getIsVerified: () => !!user.instagramUrl
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      color: 'blue',
      icon: IconBrandLinkedin,
      placeholder: 'https://linkedin.com/in/yourprofile',
      getCurrentUrl: () => user.linkedInUrl,
      getIsVerified: () => !!user.linkedInUrl
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      color: 'gray',
      icon: IconBrandX,
      placeholder: 'https://twitter.com/yourusername',
      getCurrentUrl: () => user.twitterUrl,
      getIsVerified: () => !!user.twitterUrl
    }
  ];

  // NEW: Expose method to open specific platform modal
  useImperativeHandle(ref, () => ({
    openPlatformModal: (platformId: string) => {
      console.log(`🔍 [SocialAccountsSection] Opening modal for platform: ${platformId}`);
      setActiveModal(platformId);
    }
  }));

  const handleSaveLink = async (providerId: string, url: string) => {
    console.log(`🔍 [SocialAccountsSection] handleSaveLink called for ${providerId} with URL: "${url}"`);

    setIsLoading(true);

    try {
      const columnMap: Record<string, string> = {
        instagram: 'instagram_url',
        linkedin: 'linked_in_url',
        twitter: 'twitter_url'
      };

      const column = columnMap[providerId];

      await supabase
        .from('profiles')
        .update({ [column]: url || null, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      const { data: refreshed } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (refreshed) {
        const updatedUser = transformProfileToUser(refreshed);
        onUserUpdate(updatedUser);
      }

      setActiveModal(null);
      console.log(`🔍 [SocialAccountsSection] Modal closed for ${providerId}`);
    } catch (error) {
      console.error(`🔍 [SocialAccountsSection] Failed to save ${providerId} link:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (providerId: string) => {
    console.log(`🔍 [SocialAccountsSection] Opening modal for ${providerId}`);
    setActiveModal(providerId);
  };

  const closeModal = () => {
    console.log(`🔍 [SocialAccountsSection] Closing modal`);
    setActiveModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Social Media Links</h2>
        <div className="text-sm text-gray-400">
          {socialProviders.filter(p => p.getIsVerified()).length} of {socialProviders.length} added
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-6">
        Add links to your social media profiles to help others connect with you and build trust.
      </p>

      <div className="space-y-3">
        {socialProviders.map((provider) => {
          const currentUrl = provider.getCurrentUrl();
          const isConnected = !!currentUrl;
          const IconComponent = provider.icon;

          console.log(`🔍 [SocialAccountsSection] Rendering ${provider.id} - currentUrl: "${currentUrl}", isConnected: ${isConnected}`);

          return (
            <div key={provider.id}>
              <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-600 rounded-lg">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <IconComponent size={24} className="text-gray-300 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white text-sm">{provider.name}</h3>
                      {isConnected && (
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isConnected ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openModal(provider.id)}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg font-medium text-white transition-all active:scale-95 disabled:cursor-not-allowed flex items-center gap-2 text-xs flex-shrink-0 ml-3 ${
                    isConnected
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <LinkIcon className="w-3 h-3" />
                      Edit
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-3 h-3" />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {socialProviders.map((provider) => (
        <SocialLinkModal
          key={provider.id}
          isOpen={activeModal === provider.id}
          onClose={closeModal}
          onSave={(url) => handleSaveLink(provider.id, url)}
          platform={provider}
          currentUrl={provider.getCurrentUrl()}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
});

SocialAccountsSection.displayName = 'SocialAccountsSection';