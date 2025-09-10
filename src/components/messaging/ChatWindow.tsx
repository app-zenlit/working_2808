'use client';
import { useState, useEffect, useRef } from 'react';
import { Message, User } from '../../types';
import { supabase } from '../../lib/supabase';
import { markMessagesAsRead } from '../../lib/messages';
import { isValidUuid } from '../../utils/uuid';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { 
  ChevronLeftIcon,
  UserIcon, 
  PhotoIcon, 
  FaceSmileIcon, 
  HeartIcon, 
  StarIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

// Array of available avatar icons
const avatarIcons = [
  UserIcon,
  PhotoIcon,
  FaceSmileIcon,
  HeartIcon,
  StarIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon
];

// Generate a consistent random icon based on user name
const getRandomIcon = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % avatarIcons.length;
  return avatarIcons[index];
};

interface ChatWindowProps {
  user: User; // partner
  messages: Message[]; // initial list, ascending by created_at
  onSendMessage: (content: string) => Promise<Message | null>;
  currentUserId: string;
  onBack?: () => void;
  onViewProfile?: (user: User) => void;
}

export const ChatWindow = ({
  user,
  messages,
  onSendMessage,
  currentUserId,
  onBack,
  onViewProfile,
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Update chat messages when props change
  useEffect(() => {
    setChatMessages(messages || []);
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Realtime: listen only for partner -> me inserts
  useEffect(() => {
    if (!isValidUuid(currentUserId) || !isValidUuid(user.id)) return;

    const channel = supabase.channel(`chat-${currentUserId}-${user.id}`);

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${user.id},receiver_id=eq.${currentUserId}`,
      },
      (payload) => {
        const d: any = payload.new;
        const msg: Message = {
          id: d.id,
          senderId: d.sender_id,
          receiverId: d.receiver_id,
          content: d.content,
          timestamp: d.created_at,
          read: d.read,
        };
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        markMessagesAsRead(currentUserId, user.id).catch(() => {});
      }
    );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, user.id]);

  // Mark existing unread as read when thread is open
  useEffect(() => {
    if (isValidUuid(currentUserId) && isValidUuid(user.id)) {
      markMessagesAsRead(currentUserId, user.id).catch(() => {});
    }
  }, [currentUserId, user.id]);

  // Optimistic send + reconciliation
  const handleSend = async (text: string) => {
    const tempId = `temp_${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      senderId: currentUserId,
      receiverId: user.id,
      content: text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    // Immediately add optimistic message to UI
    setChatMessages((prev) => [...prev, optimistic]);

    const saved = await onSendMessage(text);
    if (!saved) {
      // Remove optimistic message if send failed
      setChatMessages((prev) => prev.filter((m) => m.id !== tempId));
      return;
    }
    
    // Replace optimistic message with confirmed message
    setChatMessages((prev) => {
      const withoutTemp = prev.filter((m) => m.id !== tempId);
      if (withoutTemp.some((m) => m.id === saved.id)) return withoutTemp;
      return [...withoutTemp, saved];
    });
  };

  const isAnonymous = user.name === 'Anonymous';
  const IconComponent = getRandomIcon(user.name);

  const handleProfileClick = () => {
    if (isAnonymous) return;
    onViewProfile?.(user);
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
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
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center ring-2 ring-blue-500 mr-3 hover:bg-gray-600 transition-colors">
                <IconComponent className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <div className="text-left">
              <h3 className="font-semibold text-white">{user.name}</h3>
            </div>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              {user.dpUrl ? (
                <img
                  src={user.dpUrl}
                  alt={user.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4 object-cover ring-2 ring-blue-500"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4 ring-2 ring-blue-500">
                  <IconComponent className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <p className="text-gray-400">Start a conversation with {user.name}</p>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                isCurrentUser={m.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-gray-800 p-4">
        <MessageInput onSendMessage={handleSend} />
      </div>
    </div>
  );
};

