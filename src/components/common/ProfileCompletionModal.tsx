import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, UserIcon, PhotoIcon, DocumentTextIcon, LinkIcon } from '@heroicons/react/24/outline';

interface ProfileStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onContinueSetup: () => void;
  completedSteps: string[];
  totalSteps: number;
}

export const ProfileCompletionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onContinueSetup,
  completedSteps,
  totalSteps
}) => {
  if (!isOpen) return null;

  const steps: ProfileStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Name, username, age, and gender',
      completed: completedSteps.includes('basic'),
      icon: UserIcon
    },
    {
      id: 'photo',
      title: 'Profile Photo',
      description: 'Add a profile picture',
      completed: completedSteps.includes('photo'),
      icon: PhotoIcon
    },
    {
      id: 'bio',
      title: 'Bio & Story',
      description: 'Tell others about yourself',
      completed: completedSteps.includes('bio'),
      icon: DocumentTextIcon
    },
    {
      id: 'social',
      title: 'Social Links',
      description: 'Connect your social media accounts',
      completed: completedSteps.includes('social'),
      icon: LinkIcon
    }
  ];

  const completionPercentage = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
            <p className="text-sm text-gray-400 mt-1">
              {completedSteps.length} of {totalSteps} steps completed
            </p>
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
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white">Profile Progress</span>
              <span className="text-sm text-blue-400 font-semibold">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Remaining Steps:</h3>
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    step.completed
                      ? 'bg-green-900/20 border-green-700/50'
                      : 'bg-gray-800/50 border-gray-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-green-600' : 'bg-gray-700'
                  }`}>
                    {step.completed ? (
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                    ) : (
                      <IconComponent className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${
                      step.completed ? 'text-green-300' : 'text-white'
                    }`}>
                      {step.title}
                    </h4>
                    <p className={`text-xs ${
                      step.completed ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {step.completed && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Benefits */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-300 mb-2">Add social links so others can connect with you</h3>
            <ul className="text-xs text-blue-200 space-y-1">
              <li>• Add Instagram, LinkedIn, or Twitter links</li>
              <li>• Help people verify your identity</li>
              <li>• Build trust in the community</li>
              <li>• Make it easier for others to connect with you</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onContinueSetup}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <UserIcon className="w-5 h-5" />
              Continue Setup
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 active:scale-95 transition-all"
            >
              Skip for Now
            </button>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 text-center">
            You can complete these steps anytime from your profile settings
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};