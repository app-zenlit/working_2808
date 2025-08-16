import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  isConnected: boolean;
  showWhenConnected?: boolean;
  className?: string;
}

export const ConnectionStatusIndicator: React.FC<Props> = ({
  isConnected,
  showWhenConnected = false,
  className = ''
}) => {
  const shouldShow = !isConnected || showWhenConnected;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-2 ${className}`}
        >
          {isConnected ? (
            <>
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-400">Connected</span>
            </>
          ) : (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <WifiIcon className="w-4 h-4 text-yellow-500" />
              </motion.div>
              <span className="text-xs text-yellow-400">Reconnecting...</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};