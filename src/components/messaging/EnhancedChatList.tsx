import React, { useState, useEffect, useMemo } from 'react';
import { User, Message } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getConversationPreviews } from '../../lib/enhancedMessages';

interface ConversationPreview {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Props {
  users: User[];
  messages: Message[];
  nearbyIds: string[];
  selectedUser?: User;
  onSelectUser: (user: User) => void;
  currentUserId: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const EnhancedChatList: React.FC<Props> = ({
  users,
  messages,
  nearbyIds,
  selectedUser,
  onSelectUser,
  currentUserId,
  searchQuery = '',
  onSearchChange
}) => {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Load conversation previews
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      try {
        const previews = await getConversationPreviews(currentUserId);
        setConversations(previews);
      } catch (error) {
        console.error('Error loading conversation previews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [currentUserId, messages]); // Reload when messages change

  // Handle search
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    onSearchChange?.(value);
  };

  const clearSearch = () => {
    setLocalSearchQuery('');
    onSearchChange?.('');
  };

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!localSearchQuery.trim()) {
      return conversations;
    }

    const query = localSearchQuery.toLowerCase().trim();
    return conversations.filter(conv => {
      const nameMatch = conv.partnerName.toLowerCase().includes(query);
      const usernameMatch = query.startsWith('@') && 
        users.find(u => u.id === conv.partnerId)?.username?.toLowerCase().includes(query.slice(1));
      
      return nameMatch || usernameMatch;
    });
  }, [conversations, localSearchQuery, users]);

  // Get user object from conversation preview
  const getUserFromConversation = (conv: ConversationPreview): User => {
    const existingUser = users.find(u => u.id === conv.partnerId);
    if (existingUser) return existingUser;

    // Create user object from conversation data
    return {
      id: conv.partnerId,
      name: conv.partnerName,
      dpUrl: conv.partnerAvatar,
      bio: '',
      gender: 'male' as const,
      age: 25,
      distance: 0,
      links: { Twitter: '#', Instagram: '#', LinkedIn: '#' }
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-black">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Search Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Search conversations..."
          />
          {localSearchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />
            </button>
          )}
        </div>
        
        {/* Search Results Count */}
        {localSearchQuery && (
          <p className="text-xs text-gray-400 mt-2">
            {filteredConversations.length === 0 
              ? 'No conversations found' 
              : `${filteredConversations.length} conversation${filteredConversations.length !== 1 ? 's' : ''} found`
            }
          </p>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredConversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full p-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  {localSearchQuery ? (
                    <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-400 mb-2">
                  {localSearchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                <p className="text-gray-500 text-sm">
                  {localSearchQuery 
                    ? 'Try a different search term'
                    : 'Start chatting with people from the Radar screen'
                  }
                </p>
              </div>
            </motion.div>
          ) : (
            filteredConversations.map((conversation, index) => {
              const user = getUserFromConversation(conversation);
              const isSelected = selectedUser?.id === conversation.partnerId;
              const isNearby = nearbyIds.includes(conversation.partnerId);

              return (
                <motion.button
                  key={conversation.partnerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  onClick={() => onSelectUser(user)}
                  className={`flex items-center px-4 py-3 w-full text-left transition-all duration-200 ${
                    isSelected 
                      ? 'bg-blue-600/20 border-r-2 border-blue-500' 
                      : 'hover:bg-gray-900/50 active:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative flex-shrink-0">
                      {conversation.partnerAvatar ? (
                        <img
                          src={conversation.partnerAvatar}
                          alt={conversation.partnerName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-blue-500">
                          <span className="text-gray-400 text-xs">?</span>
                        </div>
                      )}
                      
                      {/* Online indicator for nearby users */}
                      {isNearby && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                      
                      {/* Unread count badge */}
                      {conversation.unreadCount > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-xs text-white font-medium">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate ${
                          conversation.unreadCount > 0 ? 'text-white' : 'text-gray-200'
                        }`}>
                          {conversation.partnerName}
                        </h3>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {format(new Date(conversation.lastMessageTime), 'HH:mm')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate pr-2 ${
                          conversation.unreadCount > 0 ? 'text-gray-300 font-medium' : 'text-gray-400'
                        }`}>
                          {conversation.lastMessage.length > 40 
                            ? `${conversation.lastMessage.substring(0, 40)}...` 
                            : conversation.lastMessage}
                        </p>
                        
                        {/* Nearby indicator */}
                        {isNearby && (
                          <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};