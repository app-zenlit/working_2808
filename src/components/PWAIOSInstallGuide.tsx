import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { isIOS, isInStandaloneMode } from './pwaUtils';

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export const PWAIOSInstallGuide: React.FC<Props> = ({ isVisible, onClose }) => {
  // Only show on iOS devices that aren't already in standalone mode
  if (!isIOS() || isInStandaloneMode()) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm"
        >
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Z</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Install Zenlit</h3>
                  <p className="text-gray-400 text-xs">Add to your home screen</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-800 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-300 mb-2">How to install on iOS:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">1</span>
                    </div>
                    <span>Tap the <ShareIcon className="w-4 h-4 inline mx-1" /> Share button below</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">2</span>
                    </div>
                    <span>Select <PlusIcon className="w-4 h-4 inline mx-1" /> "Add to Home Screen"</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">3</span>
                    </div>
                    <span>Tap "Add" to install Zenlit</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>Faster loading</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>Native app experience</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-3 text-gray-400 text-sm font-medium hover:text-white transition-colors"
              >
                Maybe later
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};