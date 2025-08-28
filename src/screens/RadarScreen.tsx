import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RadarUserCard } from '../components/radar/RadarUserCard';
import { UserProfile } from '../components/profile/UserProfile';
import { PostsGalleryScreen } from './PostsGalleryScreen';
import { User, UserLocation, LocationPermissionStatus, Post } from '../types';
import { MapPinIcon, ExclamationTriangleIcon, ChevronLeftIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { transformProfileToUser } from '../../lib/utils';
import { getUserPosts } from '../lib/posts';
import { 
  getNearbyUsers, 
  checkLocationPermission,
  isGeolocationSupported,
  isSecureContext
} from '../lib/location';
import { locationToggleManager } from '../lib/locationToggle';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '../components/common/PullToRefreshIndicator';
import { PermissionDeniedBanner } from '../components/common/PermissionDeniedBanner';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  userGender: 'male' | 'female';
  currentUser: any;
  onMessageUser?: (user: User) => void;
  onNavigateToCreate?: () => void;
  onNavigateToMessages?: () => void;
}

export const RadarScreen: React.FC<Props> = ({ 
  userGender, 
  currentUser,
  onMessageUser,
  onNavigateToCreate,
  onNavigateToMessages
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermissionStatus>({
    granted: false,
    denied: false,
    pending: true
  });
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Location toggle state - get from persistent manager
  const [isLocationEnabled, setIsLocationEnabled] = useState(locationToggleManager.isEnabled());
  const [isTogglingLocation, setIsTogglingLocation] = useState(false);

  // New state for permission denied banner
  const [showLocationDeniedBanner, setShowLocationDeniedBanner] = useState(false);

  // Profile viewing state
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);
  const [selectedProfileUserPosts, setSelectedProfileUserPosts] = useState<Post[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [showPostsGallery, setShowPostsGallery] = useState(false);

  // Refs for cleanup
  const mountedRef = useRef(true);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase().trim();
    return users.filter(user => {
      const nameMatch = user.name.toLowerCase().includes(query);
      const usernameMatch = user.username?.toLowerCase().includes(query);
      const usernameWithoutAt = query.startsWith('@') ? query.slice(1) : query;
      const usernameExactMatch = user.username?.toLowerCase().includes(usernameWithoutAt);
      
      return nameMatch || usernameMatch || usernameExactMatch;
    });
  }, [users, searchQuery]);

  // Refresh function for pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (!currentUser || !isLocationEnabled) return;
    
    setIsRefreshing(true);
    try {
      // Use location toggle manager's refresh method to get fresh location and users
      const refreshResult = await locationToggleManager.refreshLocation();
      
      if (refreshResult.success) {
        // Get the updated location from the manager
        const managerState = locationToggleManager.getState();
        if (managerState.currentLocation) {
          await loadNearbyUsers(currentUser.id, managerState.currentLocation);
        }
      } else {
        console.error('Location refresh failed:', refreshResult.error);
        setLocationError(refreshResult.error || 'Failed to refresh location');
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentUser, isLocationEnabled, currentLocation]);

  // Pull-to-refresh hook
  const {
    containerRef,
    isRefreshing: isPullRefreshing,
    pullDistance,
    isPulling,
    triggerRefresh
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: isLocationEnabled && !!currentLocation
  });

  // Listen for refresh events from tab clicks
  useEffect(() => {
    const handleRefreshEvent = () => {
      triggerRefresh();
    };

    window.addEventListener('refreshCurrentScreen', handleRefreshEvent);
    return () => {
      window.removeEventListener('refreshCurrentScreen', handleRefreshEvent);
    };
  }, [triggerRefresh]);

  useEffect(() => {
    mountedRef.current = true;
    initializeRadar();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      locationToggleManager.cleanup();
    };
  }, []);

  const initializeRadar = async () => {
    try {
      console.log('🚀 RADAR DEBUG: Initializing radar screen');
      
      if (!currentUser) {
        console.error('🚀 RADAR DEBUG: No current user provided');
        setIsLoading(false);
        return;
      }

      console.log('🚀 RADAR DEBUG: Current user found:', currentUser.id);

      // Initialize location toggle manager with current user
      locationToggleManager.initialize(
        currentUser.id,
        handleLocationUpdate,
        handleLocationError
      );

      // Get the current toggle state from the manager
      const toggleState = locationToggleManager.getState();
      setIsLocationEnabled(toggleState.isEnabled);

      // --- NEW: Check initial permission status and set banner if denied ---
      const initialPermissionStatus = await checkLocationPermission();
      setLocationPermission(initialPermissionStatus);
      if (initialPermissionStatus.denied) {
        setShowLocationDeniedBanner(true);
      } else {
        setShowLocationDeniedBanner(false);
      }
      // --- END NEW ---

      console.log('🚀 RADAR DEBUG: Location toggle state:', {
        isEnabled: toggleState.isEnabled,
        isTracking: toggleState.isTracking,
        hasCurrentLocation: !!toggleState.currentLocation
      });

      // If toggle is enabled, load users
      if (toggleState.isEnabled && toggleState.currentLocation) {
        setCurrentLocation(toggleState.currentLocation);
        await loadNearbyUsers(currentUser.id, toggleState.currentLocation);
      } else if (currentUser.latitude && currentUser.longitude) {
        // User has location data but toggle is OFF
        console.log('🚀 RADAR DEBUG: User has location data but toggle is OFF');
        const userLocation: UserLocation = {
          latitude: currentUser.latitude,
          longitude: currentUser.longitude,
          timestamp: Date.now()
        };
        setCurrentLocation(userLocation);
        setLocationPermission({ granted: true, denied: false, pending: false });
        // Don't load users since toggle is OFF
        setUsers([]);
      } else {
        console.log('🚀 RADAR DEBUG: User has no location data');
        const permissionStatus = await checkLocationPermission();
        setLocationPermission(permissionStatus);
        setUsers([]);
      }

    } catch (error) {
      console.error('🚀 RADAR DEBUG: Error initializing radar:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle location updates from toggle manager
  const handleLocationUpdate = useCallback(async (location: UserLocation | null) => {
    if (!mountedRef.current) return;

    console.log('📍 RADAR: Location update received:', location);
    setCurrentLocation(location);
    
    if (location && currentUser && isLocationEnabled) {
      // Load nearby users only if toggle is ON
      await loadNearbyUsers(currentUser.id, location);
    } else {
      // Clear users if location is null or toggle is OFF
      setUsers([]);
    }
  }, [currentUser, isLocationEnabled]);

  // Handle location errors from toggle manager
  const handleLocationError = useCallback((error: string) => {
    if (!mountedRef.current) return;

    console.error('Location error:', error);
    setLocationError(error);
  }, []);

  // Keep callbacks in sync with manager
  useEffect(() => {
    locationToggleManager.setCallbacks(handleLocationUpdate, handleLocationError);
  }, [handleLocationUpdate, handleLocationError]);

  // Load users with exact coordinate match
  const loadNearbyUsers = async (currentUserId: string, location: UserLocation) => {
    if (!isLocationEnabled) {
      // Don't load users if toggle is OFF
      setUsers([]);
      return;
    }

    try {
      console.log('🔄 RADAR DEBUG: Loading users with exact coordinate match');
      
      setIsRefreshing(true);

      // Use the updated getNearbyUsers function with coordinate matching
      const result = await getNearbyUsers(currentUserId, location, 20);

      if (!result.success) {
        console.error('Error loading nearby users:', result.error);
        if (mountedRef.current) {
          setUsers([]);
        }
        return;
      }

      // Transform profiles to User type
      const transformedUsers: User[] = (result.users || []).map(profile => {
        const user = transformProfileToUser(profile);
        user.distance = 0; // All users in same bucket have distance 0
        return user;
      });

      console.log('🔄 RADAR DEBUG: Final users in same location bucket:', transformedUsers);

      if (mountedRef.current) {
        setUsers(transformedUsers);
        console.log(`🔄 RADAR DEBUG: Set ${transformedUsers.length} users in same location bucket`);
      }
    } catch (error) {
      console.error('🔄 RADAR DEBUG: Error in loadNearbyUsers:', error);
      if (mountedRef.current) {
        setUsers([]);
      }
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false);
      }
    }
  };

  // Handle location toggle change
  const handleLocationToggle = async (enabled: boolean) => {
    if (isTogglingLocation) return;

    setIsTogglingLocation(true);
    setLocationError(null);
    setShowLocationDeniedBanner(false); // Dismiss any previous denied banner

    try {
      if (enabled) {
        console.log('🔄 Turning location toggle ON');
        
        // --- NEW: Check geolocation permission status before turning on ---
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          console.log('Geolocation permission status:', permissionStatus.state);

          if (permissionStatus.state === 'denied') {
            setShowLocationDeniedBanner(true);
            setIsTogglingLocation(false);
            return; // Do not proceed if permission is denied
          }
        } catch (permError) {
          console.warn('Could not query geolocation permission status:', permError);
          // Continue anyway, the location request will handle permission errors
        }
        // --- END NEW ---

        // Turn ON location tracking
        const result = await locationToggleManager.turnOn();
        
        if (result.success) {
          setIsLocationEnabled(true);
          console.log('✅ Location toggle turned ON successfully');

          // Get fresh location and load nearby users after successful toggle
          const managerState = locationToggleManager.getState();
          if (managerState.currentLocation) {
            setCurrentLocation(managerState.currentLocation);
            if (currentUser) {
              await loadNearbyUsers(currentUser.id, managerState.currentLocation);
            }
          }

          // Force a fresh location update and load users
          try {
            const refreshResult = await locationToggleManager.refreshLocation();
            if (refreshResult.success) {
              const updatedState = locationToggleManager.getState();
              if (updatedState.currentLocation && currentUser) {
                setCurrentLocation(updatedState.currentLocation);
                await loadNearbyUsers(currentUser.id, updatedState.currentLocation);
              }
            }
          } catch (refreshError) {
            console.error('Failed to refresh location after toggle on:', refreshError);
          }
        } else {
          console.error('❌ Failed to turn ON location toggle:', result.error);
          setLocationError(result.error || 'Failed to enable location');
          setIsLocationEnabled(false);
          if (result.error && (
            result.error.includes('denied') || 
            result.error.includes('permission') ||
            result.error.includes('PERMISSION_DENIED')
          )) {
            setShowLocationDeniedBanner(true);
          } else {
          }
        }
      } else {
        console.log('🔄 Turning location toggle OFF');
        
        // Turn OFF location tracking
        const result = await locationToggleManager.turnOff();
        
        if (result.success) {
          setIsLocationEnabled(false);
          setCurrentLocation(null);
          setUsers([]); // Clear users immediately
          console.log('✅ Location toggle turned OFF successfully');
        } else {
          console.error('❌ Failed to turn OFF location toggle:', result.error);
          setLocationError(result.error || 'Failed to disable location');
        }
      }
    } catch (error) {
      console.error('Location toggle error:', error);
      setLocationError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsTogglingLocation(false);
    }
  };

  const handleViewProfile = async (user: User) => {
    setIsLoadingProfile(true);
    try {
      console.log('Loading user profile for userId:', user.id);
      
      // Get user profile from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !profile) {
        console.error('Error loading user profile:', error);
        setIsLoadingProfile(false);
        return;
      }

      console.log('Profile loaded:', profile);

      // Transform database profile to User type
      const transformedUser: User = transformProfileToUser(profile);
      
      console.log('Transformed user:', transformedUser);

      // Load user's posts
      const userPosts = await getUserPosts(user.id);
      console.log('User posts loaded:', userPosts.length);

      setSelectedProfileUser(transformedUser);
      setSelectedProfileUserPosts(userPosts);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleMessage = (user: User) => {
    if (onMessageUser) {
      onMessageUser(user);
    }
  };

  const handleBackFromProfile = () => {
    setSelectedProfileUser(null);
    setSelectedProfileUserPosts([]);
    setShowPostsGallery(false);
  };

  const handlePostClick = () => {
    setShowPostsGallery(true);
  };

  const handleBackFromGallery = () => {
    setShowPostsGallery(false);
  };

  const handleCreateClick = () => {
    if (onNavigateToCreate) {
      onNavigateToCreate();
    }
  };

  const handleMessagesClick = () => {
    if (onNavigateToMessages) {
      onNavigateToMessages();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchBar(false);
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (!showSearchBar) {
      // Clear search when opening
      setSearchQuery('');
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading radar...</p>
        </div>
      </div>
    );
  }

  // Show profile screen if a user is selected
  if (selectedProfileUser) {
    if (showPostsGallery) {
      return (
        <PostsGalleryScreen
          user={selectedProfileUser}
          posts={selectedProfileUserPosts}
          onBack={handleBackFromGallery}
          onUserClick={() => {}}
        />
      );
    }

    return (
      <div className="min-h-full bg-black">
        <button
          onClick={handleBackFromProfile}
          className="fixed top-4 left-4 z-50 bg-gray-900/80 backdrop-blur-sm p-3 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
        {isLoadingProfile ? (
          <div className="min-h-full bg-black flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading profile...</p>
            </div>
          </div>
        ) : (
          <UserProfile
            user={selectedProfileUser}
            posts={selectedProfileUserPosts}
            onPostClick={handlePostClick}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-black relative">
      {/* Pull-to-refresh indicator */}
      <PullToRefreshIndicator
        isRefreshing={isPullRefreshing || isRefreshing}
        pullDistance={pullDistance}
        isPulling={isPulling}
        threshold={80}
      />

      {/* Location Denied Banner */}
      <PermissionDeniedBanner
        isVisible={showLocationDeniedBanner}
        permissionType="Location"
        onDismiss={() => setShowLocationDeniedBanner(false)}
        onRetry={() => {
          setShowLocationDeniedBanner(false)
          handleLocationToggle(true)
        }}
      />

      {/* Scrollable container with pull-to-refresh */}
      <div ref={containerRef} className="min-h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
          <div className="px-4 py-4">
            {/* Top Row with Title and Icons */}
            <div className="flex items-center justify-between">
              {/* Title with Toggle */}
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">Nearby</h1>
                <input
                  type="checkbox"
                  className="relative w-10 h-5 rounded-full appearance-none bg-gray-700 checked:bg-blue-600 transition-colors cursor-pointer before:absolute before:left-1 before:top-1 before:w-3 before:h-3 before:bg-white before:rounded-full before:transition-transform checked:before:translate-x-5 disabled:opacity-50 disabled:cursor-not-allowed"
                  checked={isLocationEnabled}
                  onChange={(e) => handleLocationToggle(e.target.checked)}
                  disabled={isTogglingLocation}
                />
                {(isRefreshing || isTogglingLocation || isPullRefreshing) && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-blue-400">
                      {isTogglingLocation ? 'Updating...' : 'Refreshing...'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Search Icon - Only show when location is enabled and we have users */}
              {isLocationEnabled && users.length > 0 && (
                <button
                  onClick={toggleSearchBar}
                  className="p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
                  aria-label="Search users"
                >
                  <MagnifyingGlassIcon className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
            
            {/* Inline Search Bar */}
            {showSearchBar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search by name or @username..."
                    autoFocus
                  />
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                  </button>
                </div>
                
                {/* Search Results Count */}
                {searchQuery && (
                  <p className="text-sm text-gray-400 mt-2">
                    {filteredUsers.length === 0 
                      ? 'No users found' 
                      : `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} found`
                    }
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {locationError && (
          <div className="px-4 py-3 bg-red-900/20 border-b border-red-700/30">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-400">{locationError}</span>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="px-4 py-4 space-y-4 pb-20">
          {isLocationEnabled ? (
            currentLocation ? (
              users.length > 0 ? (
                searchQuery ? (
                  filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <RadarUserCard
                        key={user.id}
                        user={user}
                        onMessage={handleMessage}
                        onViewProfile={() => handleViewProfile(user)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-400 mb-2">No users found</p>
                      <p className="text-gray-500 text-sm mb-4">
                        No users match &quot;{searchQuery}&quot;. Try a different search term.
                      </p>
                      <button
                        onClick={clearSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all text-sm"
                      >
                        Clear search
                      </button>
                    </div>
                  )
                ) : (
                  filteredUsers.map((user) => (
                  <RadarUserCard
                    key={user.id}
                    user={user}
                    onMessage={handleMessage}
                    onViewProfile={() => handleViewProfile(user)}
                  />
                  ))
                )
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPinIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400 mb-2">No one nearby right now</p>
                  <p className="text-gray-500 text-sm">
                    Move around or check back later to find people nearby!
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 mb-2">Getting your location...</p>
                <p className="text-gray-500 text-sm mb-4">
                  Please allow location access to find people nearby
                </p>
                <button
                  onClick={() => handleLocationToggle(true)}
                  disabled={isTogglingLocation || showLocationDeniedBanner} // Disable if banner is shown
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isTogglingLocation ? 'Enabling...' : 'Enable Location'}
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-2">Location tracking is off</p>
              <p className="text-gray-500 text-sm mb-4">
                Turn on the toggle to see people around you
              </p>
              <button
                onClick={() => handleLocationToggle(true)}
                disabled={isTogglingLocation || showLocationDeniedBanner} // Disable if banner is shown
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {isTogglingLocation ? 'Enabling...' : 'Turn On Location'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};