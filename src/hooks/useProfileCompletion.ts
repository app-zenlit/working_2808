import { useState, useEffect } from 'react';
import { User } from '../types';

interface ProfileCompletionState {
  completedSteps: string[];
  totalSteps: number;
  isComplete: boolean;
  showModal: boolean;
  showBanner: boolean;
}

export const useProfileCompletion = (user: User | null) => {
  const [state, setState] = useState<ProfileCompletionState>({
    completedSteps: [],
    totalSteps: 4,
    isComplete: false,
    showModal: false,
    showBanner: false
  });
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  useEffect(() => {
    // Prevent unnecessary re-renders by checking if user actually changed
    const currentUserId = user?.id || null;
    if (currentUserId === lastUserId) {
      return;
    }
    setLastUserId(currentUserId);

    if (!user) {
      setState(prev => ({
        ...prev,
        completedSteps: [],
        isComplete: false,
        showModal: false,
        showBanner: false
      }));
      return;
    }

    const completedSteps: string[] = [];

    // Check basic info completion - more lenient criteria
    if (user.name && user.name.trim() !== '' && user.name !== 'New User') {
      completedSteps.push('basic');
    }

    // Check photo completion
    if (user.dpUrl && user.dpUrl.trim() !== '' && !user.dpUrl.includes('default-avatar')) {
      completedSteps.push('photo');
    }

    // Check bio completion - must be more than default
    if (user.bio && user.bio.trim() !== '' && user.bio !== 'New to Zenlit! 👋') {
      completedSteps.push('bio');
    }

    // Check social links completion (at least one social link)
    if ((user.instagramUrl && user.instagramUrl.trim() !== '' && user.instagramUrl !== '#') ||
        (user.linkedInUrl && user.linkedInUrl.trim() !== '' && user.linkedInUrl !== '#') ||
        (user.twitterUrl && user.twitterUrl.trim() !== '' && user.twitterUrl !== '#')) {
      completedSteps.push('social');
    }

    const isComplete = completedSteps.length === 4;
    
    // Show modal on first app load if profile is incomplete
    const hasShownModal = localStorage.getItem('zenlit_profile_modal_shown') === 'true';
    const shouldShowModal = !isComplete && !hasShownModal;
    
    // Show banner if profile is incomplete and modal has been shown/dismissed
    const shouldShowBanner = !isComplete && hasShownModal;

    console.log('Profile completion check:', {
      user: user.name,
      completedSteps,
      isComplete,
      shouldShowModal,
      shouldShowBanner,
      hasShownModal
    });

    setState({
      completedSteps,
      totalSteps: 4,
      isComplete,
      showModal: shouldShowModal,
      showBanner: shouldShowBanner
    });

    // Auto-show modal on first incomplete profile load
    if (shouldShowModal) {
      setTimeout(() => {
        setState(prev => ({ ...prev, showModal: true }));
      }, 2000); // Show after 2 seconds delay to let user see the app first
    }
  }, [user, lastUserId]);

  const openModal = () => {
    setState(prev => ({ ...prev, showModal: true }));
  };

  const closeModal = () => {
    setState(prev => ({ ...prev, showModal: false, showBanner: true }));
    localStorage.setItem('zenlit_profile_modal_shown', 'true');
  };

  const dismissBanner = () => {
    setState(prev => ({ ...prev, showBanner: false }));
  };

  return {
    ...state,
    openModal,
    closeModal,
    dismissBanner
  };
};