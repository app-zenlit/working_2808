'use client'
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const IOSInstallBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detection logic for iOS and standalone mode
    const isIos = (): boolean => {
      return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    };

    const isInStandaloneMode = (): boolean => {
      return ('standalone' in window.navigator) && (window.navigator as any).standalone;
    };

    // Check if we should show the banner
    if (isIos() && !isInStandaloneMode()) {
      // Check if user has previously dismissed the banner
      const dismissed = localStorage.getItem('ios-install-banner-dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember that user dismissed the banner
    localStorage.setItem('ios-install-banner-dismissed', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      id="ios-install-banner" 
      className="install-banner visible fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 p-4 shadow-lg"
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-white font-medium text-sm mb-2">
              To install Zenlit on your iPhone:
            </p>
            <ol className="text-gray-300 text-xs space-y-1 list-decimal list-inside">
              <li>Tap the Share icon <span className="inline-block">⎘</span></li>
              <li>Select &quot;Add to Home Screen&quot;</li>
              <li>Tap &quot;Add&quot;</li>
            </ol>
          </div>
          <button
            id="ios-install-dismiss"
            onClick={handleDismiss}
            className="ml-3 p-1 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
            aria-label="Dismiss install banner"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
};