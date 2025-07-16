import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  isVisible: boolean;
  permissionType: 'Camera' | 'Location';
  onDismiss: () => void;
  onRetry: () => void;
}

export const PermissionDeniedBanner: React.FC<Props> = ({
  isVisible,
  permissionType,
  onDismiss,
  onRetry,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-800 text-white px-4 py-3 shadow-lg"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                {permissionType} access permanently denied.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRetry}
                className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30"
              >
                Try Again
              </button>
              <button
                onClick={onDismiss}
                className="p-1 rounded-full hover:bg-red-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-red-200 mt-2">
            Please enable {permissionType.toLowerCase()} permissions in your device's app settings or browser settings to use this feature.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};