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
  const [hasShownModalThisSession, setHasShownModalThisSession] = useState(false);

  useEffect(() => {
    if (!user) {
      setState(prev => ({
        ...prev,
        completedSteps: [],
        isComplete: false,
        showModal: false,
        showBanner: false
      }));
      setHasShownModalThisSession(false);
      return;
    }

    const completedSteps: string[] = [];

    // Check basic info completion - more lenient criteria
    if (user.name && user.name.trim() !== '' && user.name !== 'New User' && 
        user.username && user.username.trim() !== '' && !user.username.startsWith('user_')) {
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
    
    // Show modal if profile is incomplete and we haven't shown it this session
    const shouldShowModal = !isComplete && !hasShownModalThisSession;
    
    // Show banner only if profile is incomplete AND modal is not showing AND modal has been dismissed
    const shouldShowBanner = !isComplete && !shouldShowModal && hasShownModalThisSession;

    // Only update state if values have actually changed
    setState(prevState => {
      const stepsChanged = JSON.stringify(prevState.completedSteps) !== JSON.stringify(completedSteps);
      const isCompleteChanged = prevState.isComplete !== isComplete;
      const showModalChanged = prevState.showModal !== shouldShowModal;
      const showBannerChanged = prevState.showBanner !== shouldShowBanner;
      
      if (!stepsChanged && !isCompleteChanged && !showModalChanged && !showBannerChanged) {
        return prevState; // No changes, return existing state to prevent re-render
      }
      
      console.log('Profile completion check:', {
        user: user.name,
        completedSteps,
        isComplete,
        shouldShowModal,
        shouldShowBanner,
        hasShownModalThisSession
      });
      
      return {
        completedSteps,
        totalSteps: 4,
        isComplete,
        showModal: shouldShowModal,
        showBanner: shouldShowBanner
      };
    });
  }, [user, hasShownModalThisSession]);

  // Force show modal (for radar screen toggle or manual trigger)
  const forceShowModal = () => {
    if (!state.isComplete) {
      setHasShownModalThisSession(false); // Reset session flag to allow modal to show
      setState(prev => ({ ...prev, showModal: true }));
    }
  };
  
  const openModal = () => {
    setHasShownModalThisSession(false); // Reset session flag to allow modal to show
    setState(prev => ({ ...prev, showModal: true }));
  };

  const closeModal = () => {
    setState(prev => ({ ...prev, showModal: false, showBanner: true }));
    setHasShownModalThisSession(true);
  };

  const dismissBanner = () => {
    setState(prev => ({ ...prev, showBanner: false }));
  };

  return {
    ...state,
    openModal,
    forceShowModal,
    closeModal,
    dismissBanner
  };
};