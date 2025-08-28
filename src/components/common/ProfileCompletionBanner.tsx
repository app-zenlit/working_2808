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
  isVisible = true,
  completedSteps,
  totalSteps,
  onOpenModal
}) => {
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm border border-blue-500/30 rounded-xl shadow-lg"
    >
      <button
        onClick={onOpenModal}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 active:bg-white/10 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
            <UserIcon className="w-3 h-3 text-white" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-white font-medium text-xs truncate">
              Add Social Links - {completedSteps} of {totalSteps} steps complete
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mini Progress Bar */}
          <div className="w-8 bg-white/20 rounded-full h-1.5 shadow-inner">
            <div
              className="bg-white h-1.5 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <ChevronRightIcon className="w-3 h-3 text-white/80" />
        </div>
      </button>
    </motion.div>
  );
};