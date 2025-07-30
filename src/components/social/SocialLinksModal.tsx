import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { User, SocialProvider } from '../../types';
import { 
  IconBrandInstagram, 
  IconBrandLinkedin, 
  IconBrandX
} from '@tabler/icons-react';
import { supabase } from '../../lib/supabase';
import { transformProfileToUser, validateProfileUrl } from '../../../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  initialPlatform?: string;
}

export const SocialLinksModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  onUserUpdate,
  initialPlatform
}) => {
  const [formData, setFormData] = useState({
    instagramUrl: user.instagramUrl || '',
    linkedInUrl: user.linkedInUrl || '',
    twitterUrl: user.twitterUrl || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});

  const socialProviders: (SocialProvider & { 
    key: keyof typeof formData;
    placeholder: string;
    getCurrentUrl: () => string;
  })[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      color: 'pink',
      icon: IconBrandInstagram,
      key: 'instagramUrl',
      placeholder: 'https://instagram.com/yourusername',
      getCurrentUrl: () => formData.instagramUrl
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      color: 'blue',
      icon: IconBrandLinkedin,
      key: 'linkedInUrl',
      placeholder: 'https://linkedin.com/in/yourprofile',
      getCurrentUrl: () => formData.linkedInUrl
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      color: 'gray',
      icon: IconBrandX,
      key: 'twitterUrl',
      placeholder: 'https://twitter.com/yourusername',
      getCurrentUrl: () => formData.twitterUrl
    }
  ];

  // Reset form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        instagramUrl: user.instagramUrl || '',
        linkedInUrl: user.linkedInUrl || '',
        twitterUrl: user.twitterUrl || ''
      });
      setErrors({});
      setValidating({});
      
      // Auto-focus on specific platform if provided
      if (initialPlatform) {
        setTimeout(() => {
          const input = document.querySelector(`input[data-platform="${initialPlatform}"]`) as HTMLInputElement;
          if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [isOpen, user.instagramUrl, user.linkedInUrl, user.twitterUrl, initialPlatform]);

  const handleInputChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateUrl = async (key: keyof typeof formData, url: string) => {
    if (!url.trim()) return true;

    setValidating(prev => ({ ...prev, [key]: true }));
    
    try {
      const isValid = await validateProfileUrl(url.trim());
      if (!isValid) {
        setErrors(prev => ({ ...prev, [key]: 'Invalid or unreachable URL' }));
        return false;
      }
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, [key]: 'Unable to validate URL' }));
      return false;
    } finally {
      setValidating(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Validate all URLs
      const validationPromises = Object.entries(formData).map(async ([key, url]) => {
        if (url.trim()) {
          const isValid = await validateUrl(key as keyof typeof formData, url);
          return { key, isValid };
        }
        return { key, isValid: true };
      });

      const validationResults = await Promise.all(validationPromises);
      const hasErrors = validationResults.some(result => !result.isValid);

      if (hasErrors) {
        setIsLoading(false);
        return;
      }

      // Update profile in database
      const updateData = {
        instagram_url: formData.instagramUrl.trim() || null,
        linked_in_url: formData.linkedInUrl.trim() || null,
        twitter_url: formData.twitterUrl.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Transform and update user
      const transformedUser = transformProfileToUser(updated);
      onUserUpdate(transformedUser);
      onClose();

    } catch (error) {
      console.error('Save social links error:', error);
      setErrors({ general: 'Failed to save social links. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectedCount = () => {
    return Object.values(formData).filter(url => url.trim()).length;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Social Media Links</h2>
            <p className="text-sm text-gray-400 mt-1">
              {getConnectedCount()} of {socialProviders.length} connected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-400 mb-6">
            Add links to your social media profiles to help others connect with you and build trust.
          </p>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Social Platform Inputs */}
          <div className="space-y-4">
            {socialProviders.map((provider) => {
              const IconComponent = provider.icon;
              const currentUrl = provider.getCurrentUrl();
              const isConnected = !!currentUrl.trim();
              const hasError = !!errors[provider.key];
              const isValidating = validating[provider.key];

              return (
                <div key={provider.id} className="space-y-2">
                  {/* Platform Header */}
                  <div className="flex items-center gap-3">
                    <IconComponent size={20} className="text-gray-300 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-white text-sm">{provider.name}</h3>
                      <p className="text-xs text-gray-500">
                        {isConnected ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                    {isConnected && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="relative">
                    <input
                      type="url"
                      value={currentUrl}
                      onChange={(e) => handleInputChange(provider.key, e.target.value)}
                      onBlur={() => {
                        if (currentUrl.trim()) {
                          validateUrl(provider.key, currentUrl);
                        }
                      }}
                      data-platform={provider.id}
                      className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-10 ${
                        hasError ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder={provider.placeholder}
                    />
                    
                    {/* Validation Indicator */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidating ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : isConnected && !hasError ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      ) : null}
                    </div>
                  </div>

                  {/* Error Message */}
                  {hasError && (
                    <p className="text-red-400 text-xs">{errors[provider.key]}</p>
                  )}

                  {/* Remove Link Button */}
                  {isConnected && (
                    <button
                      onClick={() => handleInputChange(provider.key, '')}
                      className="text-red-400 hover:text-red-300 text-xs transition-colors"
                    >
                      Remove {provider.name} link
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || Object.values(validating).some(Boolean)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};