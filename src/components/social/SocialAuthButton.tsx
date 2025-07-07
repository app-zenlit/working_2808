'use client'

import React from 'react';
import { LinkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { SocialProvider } from '../../types';

interface Props {
  provider: SocialProvider;
  isConnected: boolean;
  profileUrl?: string;
  onConnect: () => void;
}

export const SocialAuthButton: React.FC<Props> = ({
  provider,
  isConnected,
  profileUrl,
  onConnect
}) => {
  const IconComponent = provider.icon;

  const getButtonText = () => (isConnected ? 'Edit Link' : 'Add Link');

  const getButtonStyle = () =>
    isConnected
      ? 'bg-blue-600 hover:bg-blue-700 border-blue-500'
      : 'bg-gray-700 hover:bg-gray-600 border-gray-600';

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-600 rounded-lg">
      <div className="flex items-center space-x-3">
        <IconComponent size={24} className="text-gray-300" />
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-white">{provider.name}</h3>
          {isConnected && profileUrl && (
            <p className="text-sm text-green-400 mt-1 truncate">{profileUrl}</p>
          )}
          {!isConnected && (
            <p className="text-sm text-gray-500">
              Not connected
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onConnect}
        className={`px-4 py-2 rounded-lg font-medium text-white transition-all active:scale-95 flex items-center gap-2 text-sm ${getButtonStyle()}`}
      >
        {isConnected ? (
          <>
            <LinkIcon className="w-4 h-4" />
            {getButtonText()}
          </>
        ) : (
          <>
            <PlusIcon className="w-4 h-4" />
            {getButtonText()}
          </>
        )}
      </button>
    </div>
  );
};