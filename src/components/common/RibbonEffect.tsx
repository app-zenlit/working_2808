import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface Props {
  isVisible: boolean;
  message?: string;
  variant?: 'default' | 'success' | 'info';
}

export const RibbonEffect: React.FC<Props> = ({ 
  isVisible, 
  message = "You've reached the end!",
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          gradient: 'from-green-600/80 to-emerald-600/80',
          sparkleColor: 'text-green-300',
          textColor: 'text-green-100'
        };
      case 'info':
        return {
          gradient: 'from-blue-600/80 to-cyan-600/80',
          sparkleColor: 'text-blue-300',
          textColor: 'text-blue-100'
        };
      default:
        return {
          gradient: 'from-purple-600/80 to-pink-600/80',
          sparkleColor: 'text-purple-300',
          textColor: 'text-purple-100'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ 
            type: 'spring',
            damping: 25,
            stiffness: 300,
            duration: 0.4
          }}
          className="ribbon-effect"
        >
          <div className={`ribbon-content bg-gradient-to-r ${styles.gradient} backdrop-blur-sm`}>
            {/* Sparkle decorations */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <motion.div
                animate={{ 
                  rotate: [0, 180, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <SparklesIcon className={`w-4 h-4 ${styles.sparkleColor}`} />
              </motion.div>
            </div>

            {/* Main content */}
            <div className="flex-1 text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-sm font-medium ${styles.textColor}`}
              >
                {message}
              </motion.p>
            </div>

            {/* Right sparkle */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <motion.div
                animate={{ 
                  rotate: [360, 180, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <SparklesIcon className={`w-4 h-4 ${styles.sparkleColor}`} />
              </motion.div>
            </div>

            {/* Animated background shimmer */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: [-100, 300] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              style={{ width: '100px' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};