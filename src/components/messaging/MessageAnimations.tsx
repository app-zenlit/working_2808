import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable animation components for messaging interface
 */

interface MessageEntranceProps {
  children: React.ReactNode;
  delay?: number;
}

export const MessageEntrance: React.FC<MessageEntranceProps> = ({ 
  children, 
  delay = 0 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.95 }}
    transition={{ 
      duration: 0.3,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth entrance
    }}
  >
    {children}
  </motion.div>
);

interface TypingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const TypingDots: React.FC<TypingDotsProps> = ({ 
  size = 'md',
  color = 'bg-gray-400'
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${sizeClasses[size]} ${color} rounded-full`}
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
  );
};

interface PulseIndicatorProps {
  children: React.ReactNode;
  isActive: boolean;
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({ 
  children, 
  isActive 
}) => (
  <motion.div
    animate={isActive ? {
      scale: [1, 1.05, 1],
    } : {}}
    transition={{
      duration: 2,
      repeat: isActive ? Infinity : 0,
      ease: 'easeInOut'
    }}
  >
    {children}
  </motion.div>
);

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({ 
  children, 
  direction = 'up',
  delay = 0 
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -20, y: 0 };
      case 'right': return { x: 20, y: 0 };
      case 'up': return { x: 0, y: 20 };
      case 'down': return { x: 0, y: -20 };
      default: return { x: 0, y: 20 };
    }
  };

  return (
    <motion.div
      initial={{ ...getInitialPosition(), opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={{ ...getInitialPosition(), opacity: 0 }}
      transition={{ 
        duration: 0.3,
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0,
  duration = 0.3 
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration, delay }}
  >
    {children}
  </motion.div>
);