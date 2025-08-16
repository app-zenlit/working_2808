import React from 'react';
import { CheckIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface Props {
  status: 'sending' | 'delivered' | 'read' | 'failed';
  readAt?: string;
  timestamp: string;
  showTimestamp?: boolean;
  size?: 'sm' | 'md';
}

export const MessageStatusIndicator: React.FC<Props> = ({
  status,
  readAt,
  timestamp,
  showTimestamp = false,
  size = 'sm'
}) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <ClockIcon className={`${iconSize} text-gray-400`} />
          </motion.div>
        );
      
      case 'delivered':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <CheckIcon className={`${iconSize} text-gray-400`} />
          </motion.div>
        );
      
      case 'read':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="relative">
              <CheckIconSolid className={`${iconSize} text-blue-500`} />
              <CheckIconSolid className={`${iconSize} text-blue-500 absolute -right-1`} />
            </div>
          </motion.div>
        );
      
      case 'failed':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ExclamationTriangleIcon className={`${iconSize} text-red-500`} />
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (showTimestamp) {
      const baseTime = format(new Date(timestamp), 'HH:mm');
      
      switch (status) {
        case 'sending':
          return `Sending... • ${baseTime}`;
        case 'delivered':
          return `Delivered • ${baseTime}`;
        case 'read':
          return readAt 
            ? `Read • ${format(new Date(readAt), 'HH:mm')}`
            : `Read • ${baseTime}`;
        case 'failed':
          return `Failed • ${baseTime}`;
        default:
          return baseTime;
      }
    }
    
    return null;
  };

  return (
    <div className="flex items-center gap-1">
      {getStatusIcon()}
      {showTimestamp && (
        <span className={`text-xs ${
          status === 'failed' ? 'text-red-400' : 
          status === 'read' ? 'text-blue-400' : 
          'text-gray-400'
        }`}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
};