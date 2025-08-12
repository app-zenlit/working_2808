import { useState, useEffect, useRef } from 'react';
import { Message, User } from '../../types';
import { supabase } from '../../lib/supabase';
import { markMessagesAsRead, sendMessage, getConversation } from '../../lib/messages';
import { isValidUuid } from '../../utils/uuid';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface ChatWindowProps {
  user: User;
  currentUserId: string;
  messages?: Message[];
  onSendMessage?: (content: string) => void;
  onBack?: () => void;
  onViewProfile?: (user: User) => void;
}

export const ChatWindow = ({
  user,
  currentUserId,
  onBack,
  onViewProfile,
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load conversation and subscribe to realtime updates
  useEffect(() => {
    if (!isValidUuid(currentUserId) || !isValidUuid(user.id)) {
      console.warn('ChatWindow: invalid UUIDs provided');
      return;
    }

    let isActive = true;

    const loadConversation = async () => {
      const conversation = await getConversation(currentUserId, user.id);
      if (isActive) {
        setChatMessages(conversation);
        scrollToBottom();
        void markMessagesAsRead(currentUserId, user.id);
      }
    };

    loadConversation();

    const channel = supabase.channel(`chat-${currentUserId}-${user.id}`);

    // Incoming messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${user.id},receiver_id=eq.${currentUserId}`,
      },
      (payload) => {
        const data = payload.new as any;
        const newMessage: Message = {
          id: data.id,
          senderId: data.sender_id,
          receiverId: data.receiver_id,
          content: data.content,
          timestamp: data.created_at,
          read: data.read,
        };

        setChatMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        void markMessagesAsRead(currentUserId, user.id);
      }
    );

    // Outgoing messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${currentUserId},receiver_id=eq.${user.id}`,
      },
      (payload) => {
        const data = payload.new as any;
        const newMessage: Message = {
          id: data.id,
          senderId: data.sender_id,
          receiverId: data.receiver_id,
          content: data.content,
          timestamp: data.created_at,
          read: data.read,
        };

        setChatMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    );

    channel.subscribe();

    return () => {
      isActive = false;
      supabase.removeChannel(channel);
    };
  }, [currentUserId, user.id]);

  const handleSend = async (content: string) => {
    if (!isValidUuid(currentUserId) || !isValidUuid(user.id)) {
      console.warn('ChatWindow: cannot send message with invalid UUIDs');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      senderId: currentUserId,
      receiverId: user.id,
      content,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setChatMessages((prev) => [...prev, tempMessage]);

    const saved = await sendMessage(currentUserId, user.id, content);
    if (saved) {
      setChatMessages((prev) =>
        prev.map((m) => (m.id === tempId ? saved : m))
      );
    } else {
      setChatMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const isAnonymous = user.name === 'Anonymous';

  const handleProfileClick = () => {
    if (isAnonymous) return;
    if (onViewProfile) {
      onViewProfile(user);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Pinned Chat Header with Back Button */}
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
            title={isAnonymous ? 'User not available' : undefined}
            className={`flex items-center flex-1 rounded-lg p-2 -m-2 transition-colors ${
              isAnonymous
                ? 'cursor-not-allowed text-gray-400'
                : 'hover:bg-gray-800/50 active:scale-95'
            }`}
          >
            {user.dpUrl ? (
              <img 
                src={user.dpUrl} 
                alt={user.name} 
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500 mr-3"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-blue-500 mr-3">
                <span className="text-gray-400 text-xs">?</span>
              </div>
            )}
            <div className="text-left">
              <h3 className="font-semibold text-white">{user.name}</h3>
            </div>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <img
                src={user.dpUrl ?? '/images/default-avatar.png'}
                alt={user.name}
                className="w-16 h-16 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-400">Start a conversation with {user.name}</p>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-800 p-4">
        <MessageInput onSendMessage={handleSend} />
      </div>
    </div>
  );
};