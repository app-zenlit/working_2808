import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  isOffline: boolean;
}

export const OfflineIndicator: React.FC<Props> = ({ isOffline }) => {
  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white px-4 py-2"
        >
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>You&apos;re offline - some features may be limited</span>
            <WifiIcon className="w-4 h-4 opacity-50" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};