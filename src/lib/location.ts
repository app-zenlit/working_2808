import { supabase } from './supabase';
import { UserLocation, LocationPermissionStatus } from '../types';

// Check if geolocation is supported
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};

// Check if we're in a secure context (required for geolocation)
export const isSecureContext = (): boolean => {
  return window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
};

// Request user's current location
export const requestUserLocation = async (): Promise<{
  success: boolean;
  location?: UserLocation;
  error?: string;
}> => {
  try {
    // Check if geolocation is supported
    if (!isGeolocationSupported()) {
      return {
        success: false,
        error: 'Geolocation is not supported by this browser'
      };
    }

    // Check if we're in a secure context
    if (!isSecureContext()) {
      return {
        success: false,
        error: 'Location access requires a secure connection (HTTPS)'
      };
    }

    console.log('Requesting user location...');

    // Request location with high accuracy and increased timeout
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 30000, // Increased to 30 seconds timeout
          maximumAge: 60000 // 1 minute cache for dynamic updates
        }
      );
    });

    // Round coordinates to 2 decimal places for privacy and performance
    const location: UserLocation = {
      latitude: Number(position.coords.latitude.toFixed(2)),
      longitude: Number(position.coords.longitude.toFixed(2)),
      accuracy: position.coords.accuracy,
      timestamp: Date.now()
    };

    console.log('Location obtained:', location);

    return {
      success: true,
      location
    };

  } catch (error: any) {
    console.error('Location request error:', error);

    let errorMessage = 'Failed to get your location. ';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += 'Location access was denied. Please enable location permissions in your browser settings.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += 'Location information is unavailable. Please check your device settings.';
        break;
      case error.TIMEOUT:
        errorMessage += 'Location request timed out. Please try again.';
        break;
      default:
        errorMessage += error.message || 'Unknown error occurred.';
        break;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

// Watch user's location for changes (dynamic tracking)
export const watchUserLocation = (
  onLocationUpdate: (location: UserLocation) => void,
  onError: (error: string) => void
): number | null => {
  try {
    if (!isGeolocationSupported()) {
      onError('Geolocation is not supported by this browser');
      return null;
    }

    if (!isSecureContext()) {
      onError('Location access requires a secure connection (HTTPS)');
      return null;
    }

    console.log('Starting location watch...');

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        // Round coordinates to 2 decimal places for privacy and performance
        const location: UserLocation = {
          latitude: Number(position.coords.latitude.toFixed(2)),
          longitude: Number(position.coords.longitude.toFixed(2)),
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };

        console.log('Location updated:', location);
        onLocationUpdate(location);
      },
      (error) => {
        console.error('Location watch error:', error);
        
        let errorMessage = 'Failed to track location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += error.message || 'Unknown error occurred.';
            break;
        }
        
        onError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 60000, // Increased to 60 seconds timeout for watch
        maximumAge: 30000 // 30 seconds cache for dynamic updates
      }
    );

    return watchId;

  } catch (error: any) {
    console.error('Error starting location watch:', error);
    onError('Failed to start location tracking');
    return null;
  }
};

// Stop watching user's location
export const stopWatchingLocation = (watchId: number): void => {
  try {
    navigator.geolocation.clearWatch(watchId);
    console.log('Location watch stopped');
  } catch (error) {
    console.error('Error stopping location watch:', error);
  }
};

// Save user's location to their profile (with rounded coordinates)
export const saveUserLocation = async (
  userId: string,
  location: UserLocation
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // Validate userId before proceeding
    if (!userId || userId === 'null' || userId === 'undefined' || typeof userId !== 'string') {
      console.error('Invalid user ID provided:', userId);
      return {
        success: false,
        error: 'Invalid user ID provided'
      };
    }

    console.log('Saving user location to profile:', userId, location);

    // Round coordinates to 2 decimal places before saving
    const latVal = typeof location.latitude === 'string' ? parseFloat(location.latitude) : location.latitude;
    const lonVal = typeof location.longitude === 'string' ? parseFloat(location.longitude) : location.longitude;
    const latRounded = Number(latVal.toFixed(2));
    const lonRounded = Number(lonVal.toFixed(2));

    const { error } = await supabase
      .from('profiles')
      .update({
        latitude: latRounded,
        longitude: lonRounded,
        updated_at: new Date().toISOString(),
        location_last_updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Location save error:', error);
      return {
        success: false,
        error: 'Failed to save location to profile'
      };
    }

    console.log('Location saved successfully');
    return { success: true };

  } catch (error) {
    console.error('Location save error:', error);
    return {
      success: false,
      error: 'Failed to save location'
    };
  }
};

// Check if location coordinates have changed (rounded comparison)
export const hasLocationChanged = (
  oldLocation: UserLocation,
  newLocation: UserLocation
): boolean => {
  const oldLat = typeof oldLocation.latitude === 'string' ? parseFloat(oldLocation.latitude) : oldLocation.latitude;
  const oldLon = typeof oldLocation.longitude === 'string' ? parseFloat(oldLocation.longitude) : oldLocation.longitude;
  const newLat = typeof newLocation.latitude === 'string' ? parseFloat(newLocation.latitude) : newLocation.latitude;
  const newLon = typeof newLocation.longitude === 'string' ? parseFloat(newLocation.longitude) : newLocation.longitude;
  const oldLatRounded = Number(oldLat.toFixed(2));
  const oldLonRounded = Number(oldLon.toFixed(2));
  const newLatRounded = Number(newLat.toFixed(2));
  const newLonRounded = Number(newLon.toFixed(2));
  
  return oldLatRounded !== newLatRounded || oldLonRounded !== newLonRounded;
};

// Define the type for users returned by the RPC function
interface DatabaseUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  bio: string;
  profile_photo_url?: string;
  cover_photo_url?: string;
  instagram_url?: string;
  linked_in_url?: string;
  twitter_url?: string;
  latitude: number;
  longitude: number;
  distance_km: number;
}

// Get nearby users using database RPC function for exact coordinate matching
export const getNearbyUsers = async (
  currentUserId: string,
  currentLocation: UserLocation,
  limit: number = 20
): Promise<{
  success: boolean;
  users?: any[];
  error?: string;
}> => {
  try {
    console.log('🔍 LOCATION DEBUG: Getting nearby users');
    console.log('📍 Current user ID:', currentUserId);
    console.log('📍 Current location:', currentLocation);
    console.log('📍 Limit:', limit);

    // Round coordinates to 2 decimal places for exact matching
    const latValue =
      typeof currentLocation.latitude === 'string'
        ? parseFloat(currentLocation.latitude)
        : currentLocation.latitude;
    const lonValue =
      typeof currentLocation.longitude === 'string'
        ? parseFloat(currentLocation.longitude)
        : currentLocation.longitude;
    const latRounded = Number(latValue.toFixed(2));
    const lonRounded = Number(lonValue.toFixed(2));

    console.log('📍 Rounded coordinates for matching:', { latRounded, lonRounded });

    // First, let's try a direct database query to see what users exist with location data
    console.log('🔍 DEBUG: Checking all users with location data...');
    const { data: allUsersWithLocation, error: allUsersError } = await supabase
      .from('profiles')
      .select('id, name, latitude, longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .not('name', 'is', null);

    if (allUsersError) {
      console.error('🔍 DEBUG: Error fetching all users with location:', allUsersError);
    } else {
      console.log('🔍 DEBUG: Found', allUsersWithLocation?.length || 0, 'users with location data');
      allUsersWithLocation?.forEach((user: any, index: number) => {
        const userLat = typeof user.latitude === 'string' ? parseFloat(user.latitude) : user.latitude;
        const userLon = typeof user.longitude === 'string' ? parseFloat(user.longitude) : user.longitude;
        const userLatRounded = Number(userLat.toFixed(2));
        const userLonRounded = Number(userLon.toFixed(2));
        console.log(`🔍 DEBUG: User ${index + 1}: ${user.name} - Lat: ${user.latitude} (${userLatRounded}), Lon: ${user.longitude} (${userLonRounded})`);
        
        if (userLatRounded === latRounded && userLonRounded === lonRounded) {
          console.log(`✅ MATCH FOUND: ${user.name} has matching coordinates!`);
        }
      });
    }

    // Try the direct query approach for exact coordinate matching
    console.log('🔍 DEBUG: Testing direct coordinate matching query...');
    const { data: directMatchUsers, error: directError } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId)
      .not('name', 'is', null)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .limit(limit);

    if (directError) {
      console.error('🔍 DEBUG: Direct query error:', directError);
    } else {
      console.log('🔍 DEBUG: Direct query returned', directMatchUsers?.length || 0, 'users');
      
      // Filter users with matching coordinates
      const matchingUsers = directMatchUsers?.filter((user: any) => {
        const userLat = typeof user.latitude === 'string' ? parseFloat(user.latitude) : user.latitude;
        const userLon = typeof user.longitude === 'string' ? parseFloat(user.longitude) : user.longitude;
        const userLatRounded = Number(userLat.toFixed(2));
        const userLonRounded = Number(userLon.toFixed(2));
        const matches = userLatRounded === latRounded && userLonRounded === lonRounded;
        
        console.log(`🔍 DEBUG: Checking ${user.name}: ${userLatRounded} === ${latRounded} && ${userLonRounded} === ${lonRounded} = ${matches}`);
        
        return matches;
      }) || [];
      
      console.log('🔍 DEBUG: Found', matchingUsers.length, 'users with matching coordinates');
      
      if (matchingUsers.length > 0) {
        console.log('🔍 LOCATION DEBUG: Using direct query results');
        
        // Process users - add distance_km field
        const usersWithDistance = matchingUsers.map((user: DatabaseUser, index: number) => {
          console.log(`🔍 LOCATION DEBUG: Processing user ${index + 1}/${matchingUsers.length}`);
          console.log('👤 User ID:', user.id);
          console.log('👤 User name:', user.name);
          console.log('👤 User latitude:', user.latitude);
          console.log('👤 User longitude:', user.longitude);

          return {
            ...user,
            distance_km: 0, // All users in same bucket have distance 0
            hasRealLocation: true
          };
        });

        console.log('🔍 LOCATION DEBUG: Final processed users:', usersWithDistance);
        console.log('🔍 LOCATION DEBUG: Final user count:', usersWithDistance.length);

        return {
          success: true,
          users: usersWithDistance
        };
      }
    }

    // Try the RPC function as fallback
    console.log('🔍 DEBUG: Trying RPC function...');
    try {
      const { data: rpcUsers, error: rpcError } = await supabase
        .rpc('get_users_in_location_bucket', {
          current_user_id: currentUserId,
          user_lat: latRounded,
          user_lng: lonRounded
        });

      console.log('🔍 DEBUG: RPC result:', { rpcUsers, rpcError });

      if (!rpcError && rpcUsers && rpcUsers.length > 0) {
        console.log('🔍 LOCATION DEBUG: Using RPC function results');
        
        const usersWithDistance = rpcUsers.map((user: DatabaseUser, index: number) => {
          console.log(`🔍 LOCATION DEBUG: Processing RPC user ${index + 1}/${rpcUsers.length}`);
          console.log('👤 User ID:', user.id);
          console.log('👤 User name:', user.name);

          return {
            ...user,
            distance_km: user.distance_km || 0,
            hasRealLocation: true
          };
        });

        return {
          success: true,
          users: usersWithDistance
        };
      }
    } catch (rpcError) {
      console.error('🔍 DEBUG: RPC function failed:', rpcError);
    }

    // If we get here, no users were found
    console.log('🔍 LOCATION DEBUG: No users found in same location bucket');
    return {
      success: true,
      users: []
    };

  } catch (error) {
    console.error('🔍 LOCATION DEBUG: Error in getNearbyUsers:', error);
    return {
      success: false,
      error: 'Failed to get nearby users'
    };
  }
};

// Check location permission status
export const checkLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    // First check if geolocation is supported at all
    if (!isGeolocationSupported()) {
      return {
        granted: false,
        denied: true,
        pending: false,
        error: 'Geolocation not supported'
      };
    }

    // Check if Permissions API is available
    if (!('permissions' in navigator)) {
      console.warn('Permissions API not available, falling back to feature detection');
      // We can't determine permission state directly, so we'll have to assume it's available
      // and let the actual geolocation request handle permissions
      return { granted: false, denied: false, pending: true };
    }

    try {
      // Check permission using the Permissions API
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      
      switch (permission.state) {
        case 'granted':
          return { granted: true, denied: false, pending: false };
        case 'denied':
          return { granted: false, denied: true, pending: false };
        case 'prompt':
          return { granted: false, denied: false, pending: true };
        default:
          return { granted: false, denied: false, pending: true };
      }
    } catch (permError) {
      console.warn('Error querying geolocation permission:', permError);
      // If we can't query permissions, assume we need to prompt
        return { granted: false, denied: false, pending: true };
    }
  } catch (error) {
    console.error('Error checking location permission:', error);
    return {
      granted: false,
      denied: false,
      pending: true,
      error: 'Unable to check location permission'
    };
  }
};

// Request location permission and get location
export const requestLocationAndSave = async (
  userId: string,
  existingLocation?: string
): Promise<{
  success: boolean;
  location?: UserLocation;
  error?: string;
}> => {
  try {
    // Validate userId before proceeding
    if (!userId || userId === 'null' || userId === 'undefined' || typeof userId !== 'string') {
      console.error('Invalid user ID provided to requestLocationAndSave:', userId);
      return {
        success: false,
        error: 'Invalid user ID provided'
      };
    }

    // First request the location
    const locationResult = await requestUserLocation();
    
    if (!locationResult.success || !locationResult.location) {
      return {
        success: false,
        error: locationResult.error
      };
    }

    // Save the location to user's profile
    const saveResult = await saveUserLocation(userId, locationResult.location);
    
    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error
      };
    }

    return {
      success: true,
      location: locationResult.location
    };

  } catch (error) {
    console.error('Error requesting location and saving:', error);
    return {
      success: false,
      error: 'Failed to get and save location'
    };
  }
};

// Debounced location update function
export const createDebouncedLocationUpdate = (
  callback: (location: UserLocation) => void,
  delay: number = 2000 // 2 seconds
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (location: UserLocation) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(location);
    }, delay);
  };
};