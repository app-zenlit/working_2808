// Location toggle management with persistent state across pages
import { supabase } from './supabase';
import { 
  requestUserLocation, 
  watchUserLocation, 
  stopWatchingLocation,
  saveUserLocation,
  clearUserLocation,
  isGeolocationSupported,
  isSecureContext,
  hasLocationChanged
} from './location';
import type { UserLocation } from '../types';

interface LocationToggleState {
  isEnabled: boolean;
  isTracking: boolean;
  watchId: number | null;
  keepAliveIntervalId: NodeJS.Timeout | null;
  currentLocation: UserLocation | null;
  failureCount: number;
  lastError: string | null;
}

// Storage key for persisting toggle state
const LOCATION_TOGGLE_STORAGE_KEY = 'zenlit_location_toggle_enabled';

class LocationToggleManager {
  private state: LocationToggleState = {
    isEnabled: false,
    isTracking: false,
    watchId: null,
    keepAliveIntervalId: null,
    currentLocation: null,
    failureCount: 0,
    lastError: null
  };

  private userId: string | null = null;
  private onLocationUpdate?: (location: UserLocation | null) => void;
  private onError?: (error: string) => void;
  private onToggleChange?: (enabled: boolean) => void;
  private visibilityChangeHandler?: () => void;

  constructor() {
    // Load persisted state from localStorage (only in browser)
    this.loadPersistedState();
    
    // Set up visibility change handler
    this.setupVisibilityHandler();
  }

  // Load persisted toggle state from localStorage
  private loadPersistedState() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('🔄 Location Toggle: Server-side rendering, skipping localStorage');
      this.state.isEnabled = false;
      return;
    }

    try {
      const savedState = localStorage.getItem(LOCATION_TOGGLE_STORAGE_KEY);
      if (savedState) {
        const isEnabled = JSON.parse(savedState);
        this.state.isEnabled = isEnabled;
        console.log('🔄 Location Toggle: Loaded persisted state - enabled:', isEnabled);
      } else {
        console.log('🔄 Location Toggle: No persisted state found, defaulting to OFF');
        this.state.isEnabled = false;
      }
    } catch (error) {
      console.error('Error loading persisted location toggle state:', error);
      this.state.isEnabled = false;
    }
  }

  // Save toggle state to localStorage
  private savePersistedState() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('🔄 Location Toggle: Server-side rendering, skipping localStorage save');
      return;
    }

    try {
      localStorage.setItem(LOCATION_TOGGLE_STORAGE_KEY, JSON.stringify(this.state.isEnabled));
      console.log('🔄 Location Toggle: Saved state to localStorage - enabled:', this.state.isEnabled);
    } catch (error) {
      console.error('Error saving location toggle state:', error);
    }
  }

  // Set up visibility change handler for background/foreground detection
  private setupVisibilityHandler() {
    if (typeof document === 'undefined') return;

    this.visibilityChangeHandler = () => {
      if (document.hidden) {
        console.log('🔄 Location Toggle: Document hidden, pausing tracking');
        this.pauseTracking();
      } else {
        console.log('🔄 Location Toggle: Document visible, resuming tracking');
        this.resumeTracking();
      }
    };

    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  // Initialize the manager with user ID and callbacks
  initialize(
    userId: string, 
    onLocationUpdate?: (location: UserLocation | null) => void,
    onError?: (error: string) => void,
    onToggleChange?: (enabled: boolean) => void
  ) {
    this.userId = userId;
    this.onLocationUpdate = onLocationUpdate;
    this.onError = onError;
    this.onToggleChange = onToggleChange;

    console.log('🔄 Location Toggle: Initializing with user:', userId, 'enabled:', this.state.isEnabled);

    // If toggle was previously enabled, restore tracking
    if (this.state.isEnabled) {
      console.log('🔄 Location Toggle: Restoring location tracking from persisted state');
      this.restoreLocationTracking();
    }
  }

  // Restore location tracking when app loads with toggle enabled
  private async restoreLocationTracking() {
    if (!this.userId) {
      console.error('Cannot restore location tracking: no user ID');
      return;
    }

    // Check if geolocation is still supported and secure
    if (!isGeolocationSupported() || !isSecureContext()) {
      console.log('🔄 Location Toggle: Geolocation no longer supported, turning OFF');
      await this.turnOff();
      return;
    }

    try {
      console.log('🔄 Location Toggle: Restoring location tracking...');
      
      // Get current location
      const locationResult = await requestUserLocation();
      
      if (locationResult.success && locationResult.location) {
        this.state.currentLocation = locationResult.location;
        this.state.failureCount = 0; // Reset failure count on success
        
        // Save to database
        await saveUserLocation(this.userId, locationResult.location);
        
        // Start continuous tracking
        this.startTracking();
        
        // Notify callback
        if (this.onLocationUpdate) {
          this.onLocationUpdate(locationResult.location);
        }
        
        console.log('✅ Location Toggle: Successfully restored location tracking');
      } else {
        console.error('❌ Location Toggle: Failed to restore location:', locationResult.error);
        
        // Handle permission denied or other critical errors
        if (locationResult.error && locationResult.error.includes('denied')) {
          await this.turnOff();
        } else {
          // For other errors, increment failure count
          this.handleGeolocationError(locationResult.error || 'Failed to restore location');
        }
      }
    } catch (error) {
      console.error('❌ Location Toggle: Error restoring location tracking:', error);
      this.handleGeolocationError('Failed to restore location tracking');
    }
  }

  // Get current toggle state
  getState() {
    return { ...this.state };
  }

  // Update callbacks without reinitializing
  setCallbacks(
    onLocationUpdate?: (location: UserLocation | null) => void,
    onError?: (error: string) => void,
    onToggleChange?: (enabled: boolean) => void
  ) {
    this.onLocationUpdate = onLocationUpdate;
    this.onError = onError;
    this.onToggleChange = onToggleChange;
  }

  // Check if toggle is enabled (for UI state)
  isEnabled() {
    return this.state.isEnabled;
  }

  // Turn location tracking ON
  async turnOn(): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'User not initialized' };
    }

    if (this.state.isEnabled) {
      console.log('🔄 Location Toggle: Already enabled, ensuring tracking is active');
      // If enabled but not tracking, start tracking
      if (!this.state.isTracking) {
        this.startTracking();
      }
      return { success: true };
    }

    try {
      console.log('🔄 Location Toggle: Turning ON');

      // Check if geolocation is supported
      if (!isGeolocationSupported() || !isSecureContext()) {
        return { success: false, error: 'Location not supported or requires HTTPS' };
      }

      // Request location permission and get current location
      const locationResult = await requestUserLocation();
      
      if (!locationResult.success || !locationResult.location) {
        return { success: false, error: locationResult.error || 'Failed to get location' };
      }

      // Save location to database
      const saveResult = await saveUserLocation(this.userId, locationResult.location);
      if (!saveResult.success) {
        return { success: false, error: saveResult.error || 'Failed to save location' };
      }

      // Update state
      this.state.isEnabled = true;
      this.state.currentLocation = locationResult.location;
      this.state.failureCount = 0; // Reset failure count on success

      // Persist state
      this.savePersistedState();

      // Start continuous tracking
      this.startTracking();

      // Notify callbacks
      if (this.onLocationUpdate) {
        this.onLocationUpdate(locationResult.location);
      }
      if (this.onToggleChange) {
        this.onToggleChange(true);
      }

      console.log('✅ Location Toggle: Successfully turned ON');
      return { success: true };

    } catch (error) {
      console.error('❌ Location Toggle: Error turning ON:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Turn location tracking OFF
  async turnOff(): Promise<{ success: boolean; error?: string }> {
    if (!this.userId) {
      return { success: false, error: 'User not initialized' };
    }

    if (!this.state.isEnabled) {
      return { success: true }; // Already off
    }

    try {
      console.log('🔄 Location Toggle: Turning OFF');

      // Stop all tracking
      this.stopTracking();

      // Clear location from database (set to null)
      const clearResult = await clearUserLocation(this.userId);
      if (!clearResult.success) {
        console.error('Failed to clear location from database:', clearResult.error);
        return { success: false, error: clearResult.error || 'Failed to clear location from database' };
      }

      // Update state
      this.state.isEnabled = false;
      this.state.currentLocation = null;
      this.state.failureCount = 0;
      this.state.lastError = null;

      // Persist state
      this.savePersistedState();

      // Notify callbacks
      if (this.onLocationUpdate) {
        this.onLocationUpdate(null);
      }
      if (this.onToggleChange) {
        this.onToggleChange(false);
      }

      console.log('✅ Location Toggle: Successfully turned OFF');
      return { success: true };

    } catch (error) {
      console.error('❌ Location Toggle: Error turning OFF:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Start continuous location tracking
  private startTracking() {
    if (this.state.isTracking || !this.state.isEnabled) {
      return; // Already tracking or toggle is OFF
    }

    console.log('🎯 Starting continuous location tracking');

    // Start watching location changes
    const watchId = watchUserLocation(
      (location: UserLocation) => {
        this.handleLocationUpdate(location);
      },
      (error: string) => {
        this.handleGeolocationError(error);
      }
    );

    if (watchId !== null) {
      this.state.watchId = watchId;
    }

    // Start keep-alive interval (every 5 minutes)
    this.state.keepAliveIntervalId = setInterval(() => {
      this.performKeepAliveUpdate();
    }, 5 * 60 * 1000); // 5 minutes

    this.state.isTracking = true;
  }

  // Stop all location tracking
  private stopTracking() {
    if (!this.state.isTracking) {
      return; // Already stopped
    }

    console.log('🛑 Stopping location tracking');

    // Stop watching location
    if (this.state.watchId !== null) {
      stopWatchingLocation(this.state.watchId);
      this.state.watchId = null;
    }

    // Clear keep-alive interval
    if (this.state.keepAliveIntervalId !== null) {
      clearInterval(this.state.keepAliveIntervalId);
      this.state.keepAliveIntervalId = null;
    }

    this.state.isTracking = false;
  }

  // Pause tracking when document is hidden
  private pauseTracking() {
    if (!this.state.isTracking) return;

    console.log('⏸️ Pausing location tracking (document hidden)');

    // Stop watching location
    if (this.state.watchId !== null) {
      stopWatchingLocation(this.state.watchId);
      this.state.watchId = null;
    }

    // Clear keep-alive interval
    if (this.state.keepAliveIntervalId !== null) {
      clearInterval(this.state.keepAliveIntervalId);
      this.state.keepAliveIntervalId = null;
    }
  }

  // Resume tracking when document becomes visible
  private resumeTracking() {
    if (!this.state.isEnabled || this.state.isTracking) return;

    console.log('▶️ Resuming location tracking (document visible)');

    // Restart tracking
    this.startTracking();

    // Perform immediate location update
    this.performKeepAliveUpdate();
  }

  // Handle location updates from watch
  private async handleLocationUpdate(location: UserLocation) {
    if (!this.state.isEnabled || !this.userId) {
      return; // Don't update if toggle is OFF
    }

    // Reset failure count on successful location update
    this.state.failureCount = 0;
    this.state.lastError = null;

    // Use the hasLocationChanged utility function for proper 2-decimal comparison
    const changed = !this.state.currentLocation || hasLocationChanged(this.state.currentLocation, location);

    if (changed) {
      console.log('📍 Location bucket changed, updating database');
      
      // Save to database
      const saveResult = await saveUserLocation(this.userId, location);
      if (saveResult.success) {
        this.state.currentLocation = location;
        
        // Notify callback
        if (this.onLocationUpdate) {
          this.onLocationUpdate(location);
        }
      } else {
        console.error('Failed to save location update:', saveResult.error);
        if (this.onError) {
          this.onError(saveResult.error || 'Failed to save location');
        }
      }
    }
  }

  // Handle geolocation errors with failure policy
  private async handleGeolocationError(error: string) {
    console.error('🚨 Geolocation error:', error);

    this.state.lastError = error;

    // Check for permission denied - immediately turn OFF
    if (error.includes('denied') || error.includes('PERMISSION_DENIED')) {
      console.log('🚨 Permission denied, auto-turning OFF toggle');
      await this.turnOff();
      if (this.onError) {
        this.onError('Location access was denied. Toggle turned off automatically.');
      }
      return;
    }

    // Increment failure count for other errors
    this.state.failureCount++;
    console.log('🚨 Failure count:', this.state.failureCount);

    // Check if we've reached the failure threshold (2 consecutive failures)
    if (this.state.failureCount >= 2) {
      console.log('🚨 Reached failure threshold, auto-turning OFF toggle');
      await this.turnOff();
      if (this.onError) {
        this.onError('Location tracking failed repeatedly. Toggle turned off automatically.');
      }
      return;
    }

    // For non-critical errors, just notify but keep trying
    if (this.onError) {
      this.onError(error);
    }
  }

  // Keep-alive location update (every 5 minutes)
  private async performKeepAliveUpdate() {
    if (!this.state.isEnabled || !this.userId) {
      return; // Don't update if toggle is OFF
    }

    try {
      console.log('🔄 Performing keep-alive location update');
      const locationResult = await requestUserLocation();
      
      if (locationResult.success && locationResult.location) {
        await this.handleLocationUpdate(locationResult.location);
      } else {
        this.handleGeolocationError(locationResult.error || 'Keep-alive location update failed');
      }
    } catch (error) {
      console.error('Keep-alive location update error:', error);
      this.handleGeolocationError(error instanceof Error ? error.message : 'Keep-alive update failed');
    }
  }

  // Manual location refresh (for screen refresh and toggle ON)
  async refreshLocation(): Promise<{ success: boolean; error?: string }> {
    if (!this.state.isEnabled || !this.userId) {
      return { success: false, error: 'Location toggle is OFF or user not initialized' };
    }

    try {
      const locationResult = await requestUserLocation();
      
      if (locationResult.success && locationResult.location) {
        const saveResult = await saveUserLocation(this.userId, locationResult.location);
        
        if (saveResult.success) {
          this.state.currentLocation = locationResult.location;
          this.state.failureCount = 0; // Reset failure count on success
          
          // Notify callback
          if (this.onLocationUpdate) {
            this.onLocationUpdate(locationResult.location);
          }
          
          return { success: true };
        } else {
          return { success: false, error: saveResult.error };
        }
      } else {
        this.handleGeolocationError(locationResult.error || 'Manual refresh failed');
        return { success: false, error: locationResult.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.handleGeolocationError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Cleanup when component unmounts
  cleanup() {
    console.log('🧹 Cleaning up location toggle manager');
    this.stopTracking();
    
    // Remove visibility change listener
    if (this.visibilityChangeHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = undefined;
    }
    
    // Don't clear currentLocation or isEnabled state - keep for next initialization
    this.onLocationUpdate = undefined;
    this.onError = undefined;
    this.onToggleChange = undefined;
  }

  // Clear all persisted state (for logout)
  clearPersistedState() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('🔄 Location Toggle: Server-side rendering, skipping localStorage clear');
      return;
    }

    try {
      localStorage.removeItem(LOCATION_TOGGLE_STORAGE_KEY);
      console.log('🔄 Location Toggle: Cleared persisted state');
    } catch (error) {
      console.error('Error clearing location toggle state:', error);
    }
  }
}

// Export singleton instance
export const locationToggleManager = new LocationToggleManager();