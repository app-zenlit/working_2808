import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, EnhancedMessage } from '../../types';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { EnhancedMessageInput } from './EnhancedMessageInput';
import { TypingIndicator } from './TypingIndicator';
import { UserProfileModal } from './UserProfileModal';
import { useRealtimeMessaging } from '../../hooks/useRealtimeMessaging';
import { ChevronLeftIcon, UserIcon, WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  user: User;
  currentUserId: string;
  onBack?: () => void;
  onViewProfile?: (user: User) => void;
  initialMessages?: EnhancedMessage[];
}

export const EnhancedChatWindow: React.FC<Props> = ({
  user,
  currentUserId,
  onBack,
  onViewProfile,
  initialMessages = []
}) => {
  const [messages, setMessages] = useState<EnhancedMessage[]>(initialMessages);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Real-time messaging hook
  const {
    isConnected,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    markAsRead
  } = useRealtimeMessaging({
    currentUserId,
    partnerId: user.id,
    onMessageReceived: (message) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      
      // Mark as read if chat is active
      if (message.senderId === user.id) {
        markAsRead([message.id]);
      }
    },
    onTypingUpdate: () => {
      // Typing updates are handled by the hook
    },
    onConnectionChange: (connected) => {
      console.log('Connection status changed:', connected);
    }
  });

  // Load current user name for typing indicators
  useEffect(() => {
    const loadCurrentUserName = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', currentUserId)
          .maybeSingle();
        
        if (profile?.name) {
          setCurrentUserName(profile.name);
        }
      } catch (error) {
        console.error('Error loading current user name:', error);
      }
    };

    loadCurrentUserName();
  }, [currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    const newMessage = await sendMessage(content, user.id);
    if (newMessage) {
      setMessages(prev => {
        // Replace temp message if it exists, otherwise add new
        const tempIndex = prev.findIndex(m => m.id.startsWith('temp-'));
        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = newMessage;
          return updated;
        }
        return [...prev, newMessage];
      });
    }
  };

  // Handle typing indicators
  const handleTypingStart = () => {
    sendTypingIndicator(true, currentUserName);
  };

  const handleTypingStop = () => {
    sendTypingIndicator(false, currentUserName);
  };

  // Handle message retry
  const handleRetryMessage = async (messageId: string) => {
    const failedMessage = messages.find(m => m.id === messageId);
    if (!failedMessage) return;

    // Update status to sending
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, status: 'sending' as const } : m
    ));

    // Retry sending
    const newMessage = await sendMessage(failedMessage.content, user.id);
    if (newMessage) {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? newMessage : m
      ));
    } else {
      // Mark as failed again
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, status: 'failed' as const } : m
      ));
    }
  };

  const handleProfileClick = () => {
    if (user.name === 'Anonymous') return;
    setShowProfileModal(true);
  };

  const handleStartChatFromProfile = () => {
    setShowProfileModal(false);
    // Focus on message input
    setTimeout(() => {
      const input = document.querySelector('textarea[placeholder*="message"]') as HTMLTextAreaElement;
      input?.focus();
    }, 100);
  };

  const isAnonymous = user.name === 'Anonymous';

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Connection Status Banner */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-yellow-600/20 border-b border-yellow-600/30 px-4 py-2"
          >
            <div className="flex items-center justify-center gap-2 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-300">Reconnecting...</span>
              <WifiIcon className="w-4 h-4 text-yellow-500 opacity-50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center px-4 py-3">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-3 p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5 text-white" />
            </button>
          )}
          
          {/* Clickable profile area */}
          <button
            onClick={handleProfileClick}
            disabled={isAnonymous}
            className={`flex items-center flex-1 rounded-lg p-2 -m-2 transition-all ${
              isAnonymous
                ? 'cursor-not-allowed'
                : 'hover:bg-gray-800/50 active:scale-95'
            }`}
          >
            <div className="relative">
              {user.dpUrl ? (
                <img 
                  src={user.dpUrl} 
                  alt={user.name} 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-blue-500">
                  <span className="text-gray-400 text-xs">?</span>
                </div>
              )}
              
              {/* Online indicator */}
              {isConnected && !isAnonymous && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
              )}
            </div>
            
            <div className="ml-3 text-left flex-1">
              <h3 className="font-semibold text-white">{user.name}</h3>
              {user.username && !isAnonymous && (
                <p className="text-gray-400 text-sm">@{user.username}</p>
              )}
            </div>
          </button>

          {/* Profile button for anonymous users */}
          {!isAnonymous && (
            <button
              onClick={handleProfileClick}
              className="ml-2 p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
              title="View profile"
            >
              <UserIcon className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 mb-2">Start a conversation</p>
                <p className="text-gray-500 text-sm">
                  Send a message to {user.name} to begin chatting
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.senderId === currentUserId;
              const showAvatar = !isCurrentUser && (
                index === 0 || 
                messages[index - 1].senderId !== message.senderId
              );

              return (
                <EnhancedMessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                  showStatus={isCurrentUser}
                  showAvatar={showAvatar}
                  userAvatar={user.dpUrl}
                  userName={user.name}
                  onRetry={handleRetryMessage}
                />
              );
            })
          )}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        <TypingIndicator 
          typingUsers={typingUsers.filter(t => t.userId === user.id)} 
        />
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-800 p-4 bg-black">
        <EnhancedMessageInput
          onSendMessage={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          disabled={!isConnected}
          placeholder={isConnected ? "Type a message..." : "Reconnecting..."}
        />
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onStartChat={handleStartChatFromProfile}
        showChatButton={false} // Already in chat
      />
    </div>
  );
};