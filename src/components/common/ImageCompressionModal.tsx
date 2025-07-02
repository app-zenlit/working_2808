import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { formatFileSize } from '../../utils/imageCompression';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  progress: {
    stage: string;
    quality?: number;
    sizeKB?: number;
  };
  originalSizeKB?: number;
}

export const ImageCompressionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  progress,
  originalSizeKB
}) => {
  if (!isOpen) return null;

  const getProgressPercentage = () => {
    switch (progress.stage) {
      case 'Loading image...':
        return 20;
      case 'Optimizing size...':
        return 40;
      case 'Compressing...':
        return 60 + (progress.quality ? (1 - progress.quality) * 30 : 0);
      case 'Finalizing...':
        return 95;
      case 'Already optimized':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-2xl w-full max-w-sm border border-gray-700"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <PhotoIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Optimizing Image</h2>
              <p className="text-sm text-gray-400">Please wait...</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white">{progress.stage}</span>
              <span className="text-sm text-gray-400">{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {originalSizeKB && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Original size:</span>
                <span className="text-white font-medium">{formatFileSize(originalSizeKB)}</span>
              </div>
            )}
            
            {progress.sizeKB && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Current size:</span>
                <span className="text-white font-medium">{formatFileSize(progress.sizeKB)}</span>
              </div>
            )}
            
            {progress.quality && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Quality:</span>
                <span className="text-white font-medium">{Math.round(progress.quality * 100)}%</span>
              </div>
            )}
          </div>

          {/* Target Range Info */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-blue-300 mb-1">Target Size Range</h3>
            <p className="text-xs text-blue-200">350 KB - 800 KB for optimal upload</p>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};