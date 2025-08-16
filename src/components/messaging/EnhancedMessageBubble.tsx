import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedMessage } from '../../types/messaging';
import { MessageStatusIndicator } from './MessageStatusIndicator';
import { format } from 'date-fns';

interface Props {
  message: EnhancedMessage;
  isCurrentUser: boolean;
  showStatus?: boolean;
  showAvatar?: boolean;
  userAvatar?: string;
  userName?: string;
  onRetry?: (messageId: string) => void;
}

export const EnhancedMessageBubble: React.FC<Props> = ({
  message,
  isCurrentUser,
  showStatus = true,
  showAvatar = false,
  userAvatar,
  userName,
  onRetry
}) => {
  const handleRetry = () => {
    if (message.status === 'failed' && onRetry) {
      onRetry(message.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth entrance
      }}
      className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {/* Avatar for other users */}
      {!isCurrentUser && showAvatar && (
        <div className="flex-shrink-0 mb-1">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName || 'User'}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-400">?</span>
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-[75%] ${isCurrentUser ? 'order-1' : 'order-2'}`}>
        <motion.div
          className={`px-4 py-3 rounded-2xl relative ${
            isCurrentUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-800 text-white rounded-bl-md'
          } ${message.status === 'failed' ? 'border border-red-500' : ''}`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.1 }}
        >
          {/* Message Content */}
          <div className="break-words">
            {message.content.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < message.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>

          {/* Message Metadata */}
          <div className={`flex items-center justify-between mt-2 gap-2 ${
            isCurrentUser ? 'flex-row-reverse' : 'flex-row'
          }`}>
            <span className={`text-xs ${
              isCurrentUser ? 'text-blue-100' : 'text-gray-400'
            }`}>
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>

            {/* Status Indicator for sent messages */}
            {isCurrentUser && showStatus && (
              <MessageStatusIndicator
                status={message.status}
                readAt={message.readAt}
                timestamp={message.timestamp}
                size="sm"
              />
            )}
          </div>

          {/* Failed Message Retry */}
          {message.status === 'failed' && isCurrentUser && (
            <motion.button
              onClick={handleRetry}
              className="absolute -bottom-8 right-0 text-xs text-red-400 hover:text-red-300 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              Tap to retry
            </motion.button>
          )}
        </motion.div>

        {/* Read Receipt Details */}
        {isCurrentUser && message.status === 'read' && message.readAt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-xs text-blue-400 mt-1 text-right"
          >
            Read {format(new Date(message.readAt), 'MMM d, HH:mm')}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};