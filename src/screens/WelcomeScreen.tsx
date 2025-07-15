'use client'
import React from 'react';
import { motion } from 'framer-motion';
import { GradientLogo } from '../components/common/GradientLogo';

interface Props {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <div className="auth-screen mobile-screen bg-black flex items-center justify-center p-4">
      <motion.div
        className="text-center w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="mb-16">
          <div className="mb-4">
            <GradientLogo size="xl" className="block mx-auto text-6xl" />
          </div>
          <p className="text-sm text-gray-400">Built with Bolt.new</p>
        </div>
        
        {/* Get Started Button */}
        <button
          onClick={onGetStarted}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-base hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
        >
          Get Started
        </button>
      </motion.div>
    </div>
  );
};