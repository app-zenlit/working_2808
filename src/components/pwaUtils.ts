/**
 * PWA utility functions for device detection and standalone mode checking
 */

/**
 * Detects if the current device is running iOS
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
};

/**
 * Detects if the app is running in standalone mode (installed as PWA)
 */
export const isInStandaloneMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for iOS standalone mode
  if ('standalone' in window.navigator) {
    return (window.navigator as any).standalone === true;
  }
  
  // Check for Android/Chrome standalone mode
  return window.matchMedia('(display-mode: standalone)').matches;
};

/**
 * Detects if the current device is Android
 */
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

/**
 * Detects if the current browser is Chrome
 */
export const isChrome = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
};