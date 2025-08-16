import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { XMarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { SocialLinks } from '../common/SocialLinks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onStartChat?: () => void;
  showChatButton?: boolean;
}

export const UserProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  onStartChat,
  showChatButton = true
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-2xl overflow-hidden">
            {user.coverPhotoUrl && (
              <img
                src={user.coverPhotoUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Profile Photo */}
          <div className="absolute -bottom-8 left-6">
            {user.dpUrl ? (
              <img
                src={user.dpUrl}
                alt={user.name}
                className="w-16 h-16 rounded-full border-4 border-gray-900 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-4 border-gray-900 bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 text-sm">?</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="pt-12 p-6 space-y-4">
          {/* User Info */}
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            {user.username && (
              <p className="text-gray-400 text-sm">@{user.username}</p>
            )}
            <p className="text-gray-300 mt-2 leading-relaxed">{user.bio}</p>
          </div>

          {/* User Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Age:</span>
              <span className="text-white">{user.age}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Distance:</span>
              <span className="text-white">{user.distance}km away</span>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Social Media</h3>
            <SocialLinks links={user.links} className="justify-start" />
          </div>

          {/* Action Buttons */}
          {showChatButton && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 active:scale-95 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onStartChat?.();
                  onClose();
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ChatBubbleLeftIcon className="w-5 h-5" />
                Message
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};