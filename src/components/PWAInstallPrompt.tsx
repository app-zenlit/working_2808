'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface Props {
  isVisible: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallPrompt: React.FC<Props> = ({ isVisible, onInstall, onDismiss }) => {
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
                  <p className="text-gray-400 text-xs">Get the full app experience</p>
                </div>
              </div>
              <button
                onClick={onDismiss}
                className="p-1 rounded-full hover:bg-gray-800 transition-colors"
              >
                <XMarkIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
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
                <span>Native app feel</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onDismiss}
                className="flex-1 py-2 px-3 text-gray-400 text-sm font-medium hover:text-white transition-colors"
              >
                Not now
              </button>
              <button
                onClick={onInstall}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Install
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};