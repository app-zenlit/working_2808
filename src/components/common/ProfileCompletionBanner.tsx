import React from 'react';
import { motion } from 'framer-motion';
import { UserIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Props {
  isVisible: boolean;
  completedSteps: number;
  totalSteps: number;
  onOpenModal: () => void;
}

export const ProfileCompletionBanner: React.FC<Props> = ({
  isVisible,
  completedSteps,
  totalSteps,
  onOpenModal
}) => {
  if (!isVisible) return null;

  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="mx-4 mb-4 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm border border-blue-500/30 rounded-2xl shadow-lg"
    >
      <button
        onClick={onOpenModal}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 active:bg-white/10 transition-colors rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-sm">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-sm">Add Social Links</p>
            <p className="text-blue-100 text-xs">
              Help others connect with you - {completedSteps} of {totalSteps} steps done
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mini Progress Bar */}
          <div className="w-16 bg-white/20 rounded-full h-2 shadow-inner">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <ChevronRightIcon className="w-5 h-5 text-white/80" />
        </div>
      </button>
    </motion.div>
  );
};