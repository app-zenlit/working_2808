'use client'
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { uploadProfileImage } from '../../lib/utils';
import { completeProfileSetup } from '../lib/auth';
import { reserveUsername, checkUsernameAvailability } from '../lib/username';
import { UsernameInput } from '../components/common/UsernameInput';

interface Props {
  onComplete: (profileData: any) => void;
  onBack?: () => void;
}

export const ProfileSetupScreen: React.FC<Props> = ({ onComplete, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    displayName: '',
    username: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | '',
  });

  // Load current user data and pre-fill form for Google users
  React.useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Error getting current user:', error);
          return;
        }

        setCurrentUser(user);
        console.log('Current user loaded:', user);
        console.log('User metadata:', user.user_metadata);
        console.log('User providers:', user.app_metadata?.providers);

        // Check if this is a Google OAuth user
        const isGoogleUser = user.app_metadata?.providers?.includes('google');
        
        if (isGoogleUser) {
          console.log('Google OAuth user detected, pre-filling form data');
          
          // Pre-fill form with Google account data
          setProfileData(prev => ({
            ...prev,
            displayName: user.user_metadata?.full_name || user.user_metadata?.name || '',
            // Don't pre-fill username - let user choose their own
          }));
        }

        // Check if user already has a profile and pre-fill existing data
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (!profileError && existingProfile) {
          console.log('Existing profile found, pre-filling form');
          setProfileData(prev => ({
            ...prev,
            displayName: existingProfile.name || prev.displayName,
            username: existingProfile.username || '',
            dateOfBirth: existingProfile.date_of_birth || '',
            gender: existingProfile.gender || ''
          }));
        }

      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };

    loadCurrentUser();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const handleUsernameValidation = (isValid: boolean, username: string) => {
    setIsUsernameValid(isValid);
    if (username !== profileData.username) {
      handleInputChange('username', username);
    }
  };

  const canProceed = () => {
    return profileData.displayName.trim() && 
           profileData.username.trim() &&
           isUsernameValid &&
           profileData.dateOfBirth && 
           profileData.gender;
  };

  const handleComplete = async () => {
    setError(null);

    // Validate all required fields
    if (!profileData.displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    if (!profileData.username.trim()) {
      setError('Please choose a username');
      return;
    }

    if (!isUsernameValid) {
      setError('Please choose a valid username');
      return;
    }

    if (!profileData.dateOfBirth) {
      setError('Please enter your date of birth');
      return;
    }

    if (!profileData.gender) {
      setError('Please select your gender');
      return;
    }

    // CRITICAL: Double-check username availability immediately before proceeding
    console.log('Final username validation before profile completion...');
    
    try {
      const usernameCheck = await checkUsernameAvailability(profileData.username);
      
      if (!usernameCheck.available) {
        setError(`Username error: ${usernameCheck.error || 'Username is not available'}`);
        return;
      }
      
      console.log('Username is available, proceeding with profile setup');
    } catch (error) {
      console.error('Username validation error:', error);
      setError('Unable to verify username availability. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not found');
      }

      // First, reserve the username
      console.log('Reserving username:', profileData.username);
      const usernameResult = await reserveUsername(profileData.username, user.id);
      
      if (!usernameResult.success) {
        throw new Error(usernameResult.error || 'Failed to reserve username');
      }

      // Complete profile setup using the auth service
      const result = await completeProfileSetup({
        fullName: profileData.displayName,
        username: profileData.username,
        bio: 'New to Zenlit! 👋', // Default bio
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        profilePhotoUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture // Use Google photo if available
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to complete profile setup');
      }

      console.log('Profile setup completed successfully');
      
      // Complete profile setup with the updated data from database
      onComplete(result.data);

    } catch (error) {
      console.error('Profile setup error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('username')) {
          setError(`Username error: ${error.message}`);
        } else {
          setError(`Failed to save profile: ${error.message}`);
        }
      } else {
        setError('Failed to save profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen mobile-screen bg-black">
      <div className="mobile-full-height flex flex-col p-4 py-8">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5 text-white" />
              </button>
            )}
            
            <h1 className="text-lg font-semibold text-white flex-1 text-center">Setup Profile</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto mobile-scroll">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
                <p className="text-gray-400">Complete your basic profile to get started</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How should people know you?"
                  maxLength={50}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <UsernameInput
                  value={profileData.username}
                  onChange={(value) => handleInputChange('username', value)}
                  onValidationChange={handleUsernameValidation}
                  placeholder="username123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [color-scheme:dark]"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'male')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      profileData.gender === 'male'
                        ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'female')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      profileData.gender === 'female'
                        ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4">
            <button
              onClick={handleComplete}
              disabled={!canProceed() || isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Complete Setup
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};