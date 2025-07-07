'use client'

import React, { useState } from 'react';
import { XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { validateProfileUrl } from '../../../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  platform: {
    id: string;
    name: string;
    placeholder: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  };
  currentUrl?: string;
  isLoading?: boolean;
}

export const SocialLinkModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  platform,
  currentUrl = '',
  isLoading = false
}) => {
  const [url, setUrl] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleSave = async () => {
    console.log(`🔍 [SocialLinkModal] handleSave called for ${platform.id}`);
    console.log(`🔍 [SocialLinkModal] Raw URL input: "${url}"`);
    console.log(`🔍 [SocialLinkModal] Trimmed URL: "${url.trim()}"`);
    
    setError(null);
    
    if (!url.trim()) {
      // Allow saving empty URL to remove the link
      console.log(`🔍 [SocialLinkModal] Saving empty URL to remove ${platform.id} link`);
      onSave('');
      return;
    }

    setChecking(true);
    const reachable = await validateProfileUrl(url.trim());
    setChecking(false);

    if (!reachable) {
      console.log('🔍 [SocialLinkModal] URL validation failed: unreachable');
      setError('Invalid or unreachable URL');
      return;
    }

    const finalUrl = url.trim();
    console.log(`🔍 [SocialLinkModal] Calling onSave with final URL: "${finalUrl}"`);
    onSave(finalUrl);
  };

  const handleUrlChange = (value: string) => {
    console.log(`🔍 [SocialLinkModal] URL input changed for ${platform.id}: "${value}"`);
    setUrl(value);
    setError(null);
  };

  const handleClose = () => {
    console.log(`🔍 [SocialLinkModal] Modal closed for ${platform.id}, resetting to currentUrl: "${currentUrl}"`);
    setUrl(currentUrl);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const IconComponent = platform.icon;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <IconComponent size={24} className="text-gray-300" />
            <h2 className="text-xl font-bold text-white">{platform.name}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profile URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder={platform.placeholder}
              disabled={isLoading || checking}
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste your {platform.name} profile URL here
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Example URLs */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-300 mb-2">Example:</h4>
            <p className="text-xs text-blue-200 font-mono break-all">
              {platform.placeholder}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              disabled={isLoading || checking}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || checking}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isLoading || checking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>

          {/* Remove Link Option */}
          {currentUrl && (
            <div className="pt-2 border-t border-gray-700">
              <button
                onClick={() => {
                  console.log(`🔍 [SocialLinkModal] Remove link clicked for ${platform.id}`);
                  onSave('');
                }}
                disabled={isLoading || checking}
                className="w-full text-red-400 hover:text-red-300 text-sm py-2 transition-colors disabled:opacity-50"
              >
                Remove {platform.name} link
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};