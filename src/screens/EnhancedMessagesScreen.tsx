import React, { useState, useEffect, useMemo } from 'react';
import { EnhancedChatList } from '../components/messaging/EnhancedChatList';
import { EnhancedChatWindow } from '../components/messaging/EnhancedChatWindow';
import { User, Message, EnhancedMessage } from '../types';
import { supabase } from '../lib/supabase';
import { getNearbyUsers } from '../lib/location';
import { getEnhancedConversation, getUnreadMessageCount } from '../lib/enhancedMessages';
import { isValidUuid } from '../utils/uuid';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Props {
  selectedUser?: User | null;
  onClearSelectedUser?: () => void;
  onViewProfile?: (user: User) => void;
  onNavigationVisibilityChange?: (visible: boolean) => void;
  onUnreadChange?: (hasUnread: boolean) => void;
  onBack?: () => void;
}

export const EnhancedMessagesScreen: React.FC<Props> = ({
  selectedUser: initialSelectedUser,
  onClearSelectedUser,
  onViewProfile,
  onNavigationVisibilityChange,
  onUnreadChange,
  onBack
}) => {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(initialSelectedUser || undefined);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [enhancedMessages, setEnhancedMessages] = useState<EnhancedMessage[]>([]);
  const [nearbyIds, setNearbyIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Load initial data
  useEffect(() => {
    loadUsersAndMessages();
  }, []);

  // Handle initial selected user
  useEffect(() => {
    if (initialSelectedUser) {
      setSelectedUser(initialSelectedUser);
      loadConversationMessages(initialSelectedUser.id);
    }
  }, [initialSelectedUser]);

  // Control navigation visibility
  useEffect(() => {
    if (onNavigationVisibilityChange) {
      const shouldShowNavigation = !selectedUser || !isMobile;
      onNavigationVisibilityChange(shouldShowNavigation);
    }

    return () => {
      if (onNavigationVisibilityChange) {
        onNavigationVisibilityChange(true);
      }
    };
  }, [selectedUser, isMobile, onNavigationVisibilityChange]);

  // Update unread count
  useEffect(() => {
    const updateUnreadCount = async () => {
      if (isValidUuid(currentUserId)) {
        const count = await getUnreadMessageCount(currentUserId);
        setTotalUnreadCount(count);
        onUnreadChange?.(count > 0);
      }
    };

    updateUnreadCount();
    
    // Update every 30 seconds
    const interval = setInterval(updateUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [currentUserId, onUnreadChange]);

  const loadUsersAndMessages = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      setCurrentUserId(currentUser.id);

      // Load all conversations
      const { data: conversations, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setAllMessages(conversations || []);

      // Get unique partner IDs
      const partnerIds = Array.from(
        new Set(
          (conversations || []).map(m =>
            m.sender_id === currentUser.id ? m.receiver_id : m.sender_id
          )
        )
      );

      // Load nearby users
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', currentUser.id)
        .maybeSingle();

      let nearbyProfiles: any[] = [];
      let nearIds: string[] = [];

      if (myProfile?.latitude && myProfile?.longitude) {
        const result = await getNearbyUsers(currentUser.id, {
          latitude: myProfile.latitude,
          longitude: myProfile.longitude,
          timestamp: Date.now()
        });

        if (result.success && result.users) {
          nearbyProfiles = result.users;
          nearIds = result.users.map((u: any) => u.id);
        }
      }

      // Load profiles for conversation partners
      const idsToFetch = partnerIds.filter(id => !nearIds.includes(id));
      let historyProfiles: any[] = [];

      if (idsToFetch.length > 0) {
        const { data: extraProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', idsToFetch);
        historyProfiles = extraProfiles || [];
      }

      // Transform profiles to users
      const allProfiles = [...nearbyProfiles, ...historyProfiles];
      const transformedUsers: User[] = allProfiles.map(profile => ({
        id: profile.id,
        name: profile.name || 'Anonymous',
        username: profile.username,
        dpUrl: profile.profile_photo_url || null,
        bio: profile.bio || '',
        gender: profile.gender || 'male',
        age: profile.date_of_birth
          ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
          : 25,
        distance: Math.floor(Math.random() * 50) + 1,
        links: {
          Twitter: profile.twitter_url || '#',
          Instagram: profile.instagram_url || '#',
          LinkedIn: profile.linked_in_url || '#',
        },
        instagramUrl: profile.instagram_url,
        linkedInUrl: profile.linked_in_url,
        twitterUrl: profile.twitter_url,
      }));

      setAllUsers(transformedUsers);
      setNearbyIds(nearIds);
    } catch (error) {
      console.error('Error loading users and messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversationMessages = async (partnerId: string) => {
    if (!isValidUuid(currentUserId) || !isValidUuid(partnerId)) return;

    try {
      const messages = await getEnhancedConversation(currentUserId, partnerId);
      setEnhancedMessages(messages);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  const handleSelectUser = async (user: User) => {
    setSelectedUser(user);
    await loadConversationMessages(user.id);
    
    if (onClearSelectedUser) {
      onClearSelectedUser();
    }
  };

  const handleBackToList = () => {
    setSelectedUser(undefined);
    setEnhancedMessages([]);
    
    if (onClearSelectedUser) {
      onClearSelectedUser();
    }
  };

  const handleViewProfile = (user: User) => {
    if (onViewProfile) {
      onViewProfile(user);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex">
      {/* Mobile: Show either chat list or chat window */}
      {isMobile ? (
        <>
          {!selectedUser ? (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-full flex flex-col"
            >
              {/* Header */}
              <div className="px-4 py-3 bg-black border-b border-gray-800 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
                    >
                      <ChevronLeftIcon className="w-6 h-6 text-white" />
                    </button>
                  )}
                  <div className="flex-1 text-center">
                    <h2 className="text-xl font-bold text-white">Messages</h2>
                    {totalUnreadCount > 0 && (
                      <p className="text-xs text-blue-400">
                        {totalUnreadCount} unread message{totalUnreadCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="w-10" />
                </div>
              </div>
              
              {/* Chat List */}
              <div className="flex-1 overflow-hidden">
                <EnhancedChatList
                  users={allUsers}
                  messages={allMessages}
                  nearbyIds={nearbyIds}
                  selectedUser={selectedUser}
                  onSelectUser={handleSelectUser}
                  currentUserId={currentUserId}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-full"
            >
              <EnhancedChatWindow
                user={selectedUser}
                currentUserId={currentUserId}
                onBack={handleBackToList}
                onViewProfile={handleViewProfile}
                initialMessages={enhancedMessages}
              />
            </motion.div>
          )}
        </>
      ) : (
        /* Desktop: Show both panels */
        <>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-80 border-r border-gray-800 flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-black border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
                  >
                    <ChevronLeftIcon className="w-6 h-6 text-white" />
                  </button>
                )}
                <div className="flex-1 text-center">
                  <h2 className="text-xl font-bold text-white">Messages</h2>
                  {totalUnreadCount > 0 && (
                    <p className="text-xs text-blue-400">
                      {totalUnreadCount} unread
                    </p>
                  )}
                </div>
                <div className="w-10" />
              </div>
            </div>
            
            {/* Chat List */}
            <div className="flex-1 overflow-hidden">
              <EnhancedChatList
                users={allUsers}
                messages={allMessages}
                nearbyIds={nearbyIds}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
                currentUserId={currentUserId}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1"
          >
            {selectedUser ? (
              <EnhancedChatWindow
                user={selectedUser}
                currentUserId={currentUserId}
                onViewProfile={handleViewProfile}
                initialMessages={enhancedMessages}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 mb-2">Select a conversation</p>
                  <p className="text-gray-500 text-sm">
                    Choose a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};