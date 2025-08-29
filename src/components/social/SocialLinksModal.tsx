import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { User, SocialProvider } from '../../types';
import { 
  IconBrandInstagram, 
  IconBrandLinkedin, 
  IconBrandX
} from '@tabler/icons-react';
import { validateProfileUrl } from '../../../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdate: (updatedUser: User) => void;
  /** When provided, the modal will focus the corresponding input on open */
  initialPlatform?: string | null;
}

export const SocialLinksModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  onUserUpdate,
  initialPlatform,
}) => {
  const [formData, setFormData] = useState({
    instagramUrl: user.instagramUrl || '',
    linkedInUrl: user.linkedInUrl || '',
    twitterUrl: user.twitterUrl || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});

  const inputRefs: Record<string, React.RefObject<HTMLInputElement>> = {
    instagram: useRef<HTMLInputElement>(null),
    linkedin: useRef<HTMLInputElement>(null),
    twitter: useRef<HTMLInputElement>(null),
  };

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
    }
  }, [isOpen, user]);

  // Focus the input for the requested platform when opening
  useEffect(() => {
    if (isOpen && initialPlatform && inputRefs[initialPlatform]) {
      setTimeout(() => {
        inputRefs[initialPlatform]?.current?.focus();
      }, 100);
    }
  }, [isOpen, initialPlatform]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateAndUpdateUser = async (key: keyof typeof formData, url: string) => {
    const trimmedUrl = url.trim();
    
    // If URL is empty, immediately update parent with empty value (remove link)
    if (!trimmedUrl) {
      const updatedUser = {
        ...user,
        [`${key}`]: '',
        links: {
          ...user.links,
          [key === 'instagramUrl' ? 'Instagram' : key === 'linkedInUrl' ? 'LinkedIn' : 'Twitter']: ''
        }
      };
      onUserUpdate(updatedUser);
      return;
    }

    setValidating(prev => ({ ...prev, [key]: true }));
    
    try {
      const isValid = await validateProfileUrl(trimmedUrl);
      
      if (isValid) {
        // URL is valid, update parent state immediately
        const updatedUser = {
          ...user,
          [`${key}`]: trimmedUrl,
          links: {
            ...user.links,
            [key === 'instagramUrl' ? 'Instagram' : key === 'linkedInUrl' ? 'LinkedIn' : 'Twitter']: trimmedUrl
          }
        };
        onUserUpdate(updatedUser);
        
        // Clear any existing error
        setErrors(prev => ({ ...prev, [key]: '' }));
      } else {
        // URL is invalid, show error and don't update parent
        setErrors(prev => ({ ...prev, [key]: 'Invalid or unreachable URL' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, [key]: 'Unable to validate URL' }));
    } finally {
      setValidating(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleInputBlur = (key: keyof typeof formData) => {
    const url = formData[key];
    if (url !== (user[key] || '')) {
      // URL has changed, validate and update
      validateAndUpdateUser(key, url);
    }
  };

  const handleRemoveLink = (key: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [key]: '' }));
    validateAndUpdateUser(key, '');
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
            Add links to your social media profiles. Changes are saved automatically when you finish editing.
          </p>

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
                    {isConnected && !hasError && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="relative">
                    <input
                      type="url"
                      value={currentUrl}
                      onChange={(e) => handleInputChange(provider.key, e.target.value)}
                      onBlur={() => handleInputBlur(provider.key)}
                      className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-10 ${
                        hasError ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder={provider.placeholder}
                      ref={inputRefs[provider.id]}
                    />
                    
                    {/* Validation Indicator */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidating ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : isConnected && !hasError ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      ) : hasError ? (
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
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
                      onClick={() => handleRemoveLink(provider.key)}
                      className="text-red-400 hover:text-red-300 text-xs transition-colors"
                    >
                      Remove {provider.name} link
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Message */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mt-6">
            <h3 className="text-sm font-medium text-blue-300 mb-1">How it works</h3>
            <p className="text-xs text-blue-200">
              Enter your social media URLs and they&apos;ll be validated automatically. Changes are saved to your profile when you click &quot;Save&quot; in the main edit screen.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};