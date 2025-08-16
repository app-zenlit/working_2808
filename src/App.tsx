'use client'
import { useState, useEffect } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ProfileSetupScreen } from './screens/ProfileSetupScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RadarScreen } from './screens/RadarScreen';
import { UserProfileScreen } from './screens/UserProfileScreen';
import { EditProfileScreen } from './screens/EditProfileScreen';
import { CreatePostScreen } from './screens/CreatePostScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { UserGroupIcon, HomeIcon, UserIcon, PlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { User } from './types';
import './styles/messaging.css';
import { supabase, onAuthStateChange } from './lib/supabase';
import { checkSession, handleRefreshTokenError } from './lib/auth';
import { locationToggleManager } from './lib/locationToggle';
import { transformProfileToUser } from '../lib/utils';
import { usePWA } from './hooks/usePWA';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'profileSetup' | 'app'>('welcome');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userGender] = useState<'male' | 'female'>('male');
  const [activeTab, setActiveTab] = useState('radar');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPlatform, setEditPlatform] = useState<string | null>(null);

  // PWA hooks
  const { isInstallable, isOffline, installApp, showInstallPrompt, dismissInstallPrompt } = usePWA();

  // Ensure we're on the client side before doing anything
  useEffect(() => {
    setIsClient(true);
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    if (!isClient) return;

    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, checking profile...');
        await handleAuthenticatedUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        handleSignOut();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed successfully');
        // Session is automatically updated by Supabase
      } else if (event === 'TOKEN_REFRESH_FAILED') {
        console.error('Token refresh failed');
        await handleRefreshTokenError();
      }
    });

    return () => subscription.unsubscribe();
  }, [isClient]);

  // Check authentication status on app load
  useEffect(() => {
    if (isClient) {
      checkAuthStatus();
    }
  }, [isClient]);

  const checkAuthStatus = async () => {
    try {
      // Check if Supabase is available
      if (!supabase) {
        console.warn('Supabase not available, using offline mode');
        setCurrentScreen('welcome');
        setIsLoading(false);
        return;
      }

      console.log('Checking authentication status...');

      // Check if we have a valid session with network error handling
      const sessionResult = await checkSession();
      
      if (!sessionResult.success) {
        console.log('No valid session found:', sessionResult.error);
        setCurrentScreen('welcome');
        setIsLoading(false);
        return;
      }

      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session fetch error:', error);
          setCurrentScreen('welcome');
          setIsLoading(false);
          return;
        }
        
        if (!sessionData.session) {
          console.log('No active session found');
          setCurrentScreen('welcome');
          setIsLoading(false);
          return;
        }

        const user = sessionData.session.user;
        console.log('Valid session found for user:', user.id);

        await handleAuthenticatedUser(user);
      } catch (networkError) {
        console.error('Network error during session check:', networkError);
        // If there's a network error, fall back to welcome screen
        setCurrentScreen('welcome');
        setIsLoading(false);
        return;
      }
      
    } catch (error) {
      console.error('Auth check error:', error);
      setCurrentScreen('welcome');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticatedUser = async (user: any) => {
    try {
      console.log('Handling authenticated user:', user.id);
      console.log('User metadata:', user.user_metadata);

      // CRITICAL: Check if user is still in signup flow
      if (user.user_metadata?.signup_flow === true) {
        console.log('User is still in signup flow - keeping LoginScreen mounted for password setup');
        setCurrentScreen('login'); // Keep LoginScreen mounted
        return; // Don't proceed to profile setup yet
      }

      console.log('User has completed signup flow, proceeding with profile check...');

      // Check if user has a profile with proper error handling
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // No profile found (not an error)
            console.log('No profile found, redirecting to profile setup');
            setCurrentScreen('profileSetup');
            return;
          } else {
            console.error('Profile fetch error:', profileError);
            // For other database errors, still allow profile setup
            setCurrentScreen('profileSetup');
            return;
          }
        }

        if (!profile) {
          console.log('No profile found, redirecting to profile setup');
          setCurrentScreen('profileSetup');
          return;
        }

        console.log('Profile found:', profile);
        setCurrentUser(profile);
        setIsLoggedIn(true);

        // Check if profile has essential fields filled out
        const isProfileComplete = profile.name && 
                                 profile.bio && 
                                 profile.date_of_birth && 
                                 profile.gender &&
                                 profile.username;

        if (isProfileComplete) {
          setCurrentScreen('app');
        } else {
          setCurrentScreen('profileSetup');
        }
      } catch (networkError) {
        console.error('Network error fetching profile:', networkError);
        // If we can't fetch the profile due to network issues,
        // redirect to profile setup where they can try again
        setCurrentScreen('profileSetup');
        return;
      }
    } catch (error) {
      console.error('Error handling authenticated user:', error);
      setCurrentScreen('profileSetup');
    }
  };

  const handleLogin = async () => {
    console.log('Login successful, checking user state...');
    setIsLoggedIn(true);
    
    // The auth state change listener will handle the rest
    // Just wait a moment for the session to be established
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleProfileSetupComplete = (profileData: any) => {
    console.log('Profile setup completed:', profileData);
    // Use the profile data directly from the setup screen
    // This data already includes profile_completed: true
    setCurrentUser(profileData);
    setCurrentScreen('app');
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentScreen('welcome');
    setActiveTab('radar');
    setSelectedUser(null);
    setSelectedChatUser(null);
    setIsNavigationVisible(true);
    
    // Clear location toggle state on logout
    locationToggleManager.clearPersistedState();
  };

  const handleLogout = async () => {
    try {
      if (supabase) {
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              latitude: null,
              longitude: null,
              location_last_updated_at: null
            })
            .eq('id', user.id);
          if (updateError) {
            console.error('Failed to clear location on logout:', updateError);
          }
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Logout error:', error);
        }
      }
      // handleSignOut will be called by the auth state listener
    } catch (error) {
      console.error('Logout error:', error);
      // Force sign out anyway
      handleSignOut();
    }
  };

  const handleMessageUser = (user: User) => {
    setSelectedChatUser(user);
    setActiveTab('messages');
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setActiveTab('profile');
  };

  const handleEditProfile = (platform?: string) => {
    setEditPlatform(platform || null);
    setIsEditingProfile(true);
  };

  const handleProfileSave = (updatedUser: User) => {
    setIsEditingProfile(false);
    setEditPlatform(null);
    if (selectedUser && selectedUser.id === updatedUser.id) {
      setSelectedUser(updatedUser);
    }
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser({ ...currentUser, ...updatedUser });
    }
  };

  const handleNavigateToCreate = () => {
    setActiveTab('create');
  };

  const handleNavigateToMessages = () => {
    setActiveTab('messages');
  };

  // Handle navigation visibility changes from MessagesScreen
  const handleNavigationVisibilityChange = (visible: boolean) => {
    setIsNavigationVisible(visible);
  };

  // Handle back navigation from Messages and CreatePost
  const handleBackFromMessages = () => {
    setActiveTab('radar'); // Go back to radar screen
    setSelectedChatUser(null);
  };

  const handleBackFromCreatePost = () => {
    setActiveTab('radar'); // Go back to radar screen
  };

  // Handle tab click refresh
  const handleTabClick = (tabName: string) => {
    if (activeTab === tabName) {
      // If already on this tab, trigger refresh
      const event = new CustomEvent('refreshCurrentScreen');
      window.dispatchEvent(event);
    } else {
      setActiveTab(tabName);
    }
  };

  const profileUser = selectedUser
    ? selectedUser
    : currentUser
    ? transformProfileToUser(currentUser)
    : null;

  // Don't render anything until we're on the client
  if (!isClient) {
    return null;
  }

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show welcome screen first
  if (currentScreen === 'welcome') {
    return (
      <>
        <WelcomeScreen onGetStarted={() => setCurrentScreen('login')} />
        <PWAInstallPrompt
          isVisible={showInstallPrompt}
          onInstall={installApp}
          onDismiss={dismissInstallPrompt}
        />
      </>
    );
  }

  // Show login screen after get started is clicked
  if (currentScreen === 'login') {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <OfflineIndicator isOffline={isOffline} />
      </>
    );
  }

  // Show profile setup screen for new users
  if (currentScreen === 'profileSetup') {
    return (
      <>
        <ProfileSetupScreen 
          onComplete={handleProfileSetupComplete}
          onBack={() => setCurrentScreen('login')}
        />
        <OfflineIndicator isOffline={isOffline} />
      </>
    );
  }

  // Show main app after login and profile setup
  return (
    <>
      <div className="h-screen bg-black text-white overflow-hidden flex flex-col mobile-container">
        {/* Mobile App Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden relative content-with-nav">
            <div className="h-full">
              {activeTab === 'radar' && (
                <div className="h-full overflow-y-auto mobile-scroll">
                  <RadarScreen 
                    userGender={userGender} 
                    currentUser={currentUser}
                    onMessageUser={handleMessageUser}
                    onNavigateToCreate={handleNavigateToCreate}
                    onNavigateToMessages={handleNavigateToMessages}
                  />
                </div>
              )}
              {activeTab === 'feed' && (
                <div className="h-full overflow-y-auto mobile-scroll">
                  <HomeScreen 
                    userGender={userGender}
                    onNavigateToCreate={handleNavigateToCreate}
                    onNavigateToMessages={handleNavigateToMessages}
                  />
                </div>
              )}
              {activeTab === 'create' && (
                <div className="h-full overflow-y-auto mobile-scroll">
                  <CreatePostScreen onBack={handleBackFromCreatePost} />
                </div>
              )}
              {activeTab === 'messages' && (
                <div className="h-full">
                  <EnhancedMessagesScreen
                    selectedUser={selectedChatUser}
                    onClearSelectedUser={() => setSelectedChatUser(null)}
                    onViewProfile={handleViewProfile}
                    onNavigationVisibilityChange={handleNavigationVisibilityChange}
                    onUnreadChange={setHasUnreadMessages}
                    onBack={handleBackFromMessages}
                  />
                </div>
              )}
              {activeTab === 'profile' && profileUser && (
                <div className="h-full overflow-y-auto mobile-scroll">
                  {isEditingProfile ? (
                    <EditProfileScreen
                      user={profileUser}
                      onBack={() => {
                        setIsEditingProfile(false);
                        setEditPlatform(null);
                      }}
                      onSave={handleProfileSave}
                      initialPlatform={editPlatform}
                    />
                  ) : (
                    <UserProfileScreen
                      user={profileUser}
                      onBack={selectedUser ? () => setSelectedUser(null) : undefined}
                      onEditProfile={handleEditProfile}
                      isCurrentUser={!selectedUser}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Bottom Navigation - Conditionally visible */}
          {isNavigationVisible && (
            <nav className="bg-gray-900 border-t border-gray-800 flex-shrink-0 bottom-nav pb-2">
              <div className="flex justify-around items-center py-3 px-4 h-14 space-x-4">
                <button
                  onClick={() => handleTabClick('radar')}
                  className={`nav-button-mobile flex items-center justify-center p-1 rounded-lg transition-colors ${
                    activeTab === 'radar' ? 'text-blue-500' : 'text-gray-400'
                  }`}
                >
                  <UserGroupIcon className="h-6 w-6" />
                </button>

                <button
                  onClick={() => handleTabClick('feed')}
                  className={`nav-button-mobile flex items-center justify-center p-1 rounded-lg transition-colors ${
                    activeTab === 'feed' ? 'text-blue-500' : 'text-gray-400'
                  }`}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </button>

                <button
                  onClick={() => handleTabClick('create')}
                  className={`nav-button-mobile flex items-center justify-center p-1 rounded-lg transition-colors ${
                    activeTab === 'create' ? 'text-blue-500' : 'text-gray-400'
                  }`}
                >
                  <PlusIcon className="h-6 w-6" />
                </button>

                <button
                  onClick={() => handleTabClick('messages')}
                  className={`nav-button-mobile flex items-center justify-center p-1 rounded-lg transition-colors ${
                    activeTab === 'messages' ? 'text-blue-500' : 'text-gray-400'
                  }`}
                >
                  <ChatBubbleLeftIcon className="h-6 w-6" />
                </button>

                <button
                  onClick={() => handleTabClick('profile')}
                  className={`nav-button-mobile flex items-center justify-center p-1 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'text-blue-500' : 'text-gray-400'
                  }`}
                >
                  <UserIcon className="w-6 h-6" />
                </button>
              </div>
              {/* Additional padding below navigation with same background color */}
              <div className="bg-gray-900 h-2"></div>
            </nav>
          )}
        </div>
      </div>

      {/* PWA Components */}
      <PWAInstallPrompt
        isVisible={showInstallPrompt}
        onInstall={installApp}
        onDismiss={dismissInstallPrompt}
      />
      <OfflineIndicator isOffline={isOffline} />
    </>
  );
}