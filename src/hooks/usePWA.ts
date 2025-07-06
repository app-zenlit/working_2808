import { useState, useEffect } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAHook {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  installApp: () => Promise<void>;
  showInstallPrompt: boolean;
  dismissInstallPrompt: () => void;
}

export const usePWA = (): PWAHook => {
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }
    
    // Set initial offline status
    setIsOffline(!navigator.onLine);
    
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as any);
      setIsInstallable(true);
      
      // Show install prompt after a delay (better UX)
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      console.log('PWA was installed');
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial checks
    checkInstalled();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Empty dependency array

  const installApp = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setInstallPrompt(null);
      setIsInstallable(false);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error installing app:', error);
    }
  };

  const dismissInstallPrompt = () => {
    if (typeof window === 'undefined') return;
    
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show install prompt if dismissed in this session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setShowInstallPrompt(false);
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOffline,
    installApp,
    showInstallPrompt,
    dismissInstallPrompt,
  };
};