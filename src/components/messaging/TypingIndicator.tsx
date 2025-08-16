import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypingIndicator as TypingIndicatorType } from '../../types/messaging';

interface Props {
  typingUsers: TypingIndicatorType[];
  className?: string;
}

export const TypingIndicator: React.FC<Props> = ({ typingUsers, className = '' }) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: 10, height: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`px-4 py-2 ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {/* Animated typing dots */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
          <span className="text-sm text-gray-400 italic">
            {getTypingText()}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};