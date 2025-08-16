import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { EnhancedMessage, TypingIndicator, RealtimeSubscription } from '../types/messaging';
import { isValidUuid } from '../utils/uuid';

interface UseRealtimeMessagingOptions {
  currentUserId: string;
  partnerId?: string;
  onMessageReceived?: (message: EnhancedMessage) => void;
  onTypingUpdate?: (typing: TypingIndicator[]) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export const useRealtimeMessaging = ({
  currentUserId,
  partnerId,
  onMessageReceived,
  onTypingUpdate,
  onConnectionChange
}: UseRealtimeMessagingOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (subscriptionRef.current?.channel) {
      supabase.removeChannel(subscriptionRef.current.channel);
      subscriptionRef.current = null;
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  // Initialize real-time subscription
  useEffect(() => {
    if (!isValidUuid(currentUserId)) return;

    const channelName = partnerId 
      ? `chat-${[currentUserId, partnerId].sort().join('-')}`
      : `inbox-${currentUserId}`;

    console.log('🔄 Setting up real-time subscription:', channelName);

    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: currentUserId }
      }
    });

    // Listen for new messages
    channel.on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: partnerId 
          ? `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId}))`
          : `receiver_id.eq.${currentUserId}`
      },
      (payload) => {
        const data = payload.new as any;
        const newMessage: EnhancedMessage = {
          id: data.id,
          senderId: data.sender_id,
          receiverId: data.receiver_id,
          content: data.content,
          timestamp: data.created_at,
          read: data.read,
          status: 'delivered',
          type: 'text'
        };

        console.log('📨 New message received:', newMessage);
        onMessageReceived?.(newMessage);
      }
    );

    // Listen for message status updates
    channel.on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'messages'
      },
      (payload) => {
        const data = payload.new as any;
        if (data.read && data.sender_id === currentUserId) {
          console.log('📖 Message marked as read:', data.id);
          // Handle read receipt update
        }
      }
    );

    // Listen for typing indicators via presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const typing: TypingIndicator[] = [];
      
      Object.entries(state).forEach(([userId, presences]: [string, any[]]) => {
        const presence = presences[0];
        if (presence?.typing && userId !== currentUserId) {
          typing.push({
            userId,
            userName: presence.userName || 'User',
            isTyping: true,
            timestamp: Date.now()
          });
        }
      });
      
      setTypingUsers(typing);
      onTypingUpdate?.(typing);
    });

    // Handle connection status
    channel.on('system', {}, (payload) => {
      const connected = payload.status === 'SUBSCRIBED';
      setIsConnected(connected);
      onConnectionChange?.(connected);
      console.log('🔌 Connection status:', connected ? 'Connected' : 'Disconnected');
    });

    // Subscribe to channel
    channel.subscribe((status) => {
      console.log('📡 Subscription status:', status);
      setIsConnected(status === 'SUBSCRIBED');
    });

    subscriptionRef.current = {
      channel,
      isConnected: false,
      lastHeartbeat: Date.now()
    };

    // Setup heartbeat for connection monitoring
    heartbeatRef.current = setInterval(() => {
      if (subscriptionRef.current) {
        subscriptionRef.current.lastHeartbeat = Date.now();
      }
    }, 30000); // 30 seconds

    return cleanup;
  }, [currentUserId, partnerId, onMessageReceived, onTypingUpdate, onConnectionChange, cleanup]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (isTyping: boolean, userName: string) => {
    if (!subscriptionRef.current?.channel || !isValidUuid(currentUserId)) return;

    try {
      await subscriptionRef.current.channel.track({
        typing: isTyping,
        userName,
        timestamp: Date.now()
      });

      // Auto-clear typing after 3 seconds
      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingIndicator(false, userName);
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }, [currentUserId]);

  // Send message with status tracking
  const sendMessage = useCallback(async (content: string, receiverId: string): Promise<EnhancedMessage | null> => {
    if (!isValidUuid(currentUserId) || !isValidUuid(receiverId)) return null;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: EnhancedMessage = {
      id: tempId,
      senderId: currentUserId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'sending',
      type: 'text'
    };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: receiverId,
          content
        })
        .select()
        .single();

      if (error) throw error;

      const finalMessage: EnhancedMessage = {
        id: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        content: data.content,
        timestamp: data.created_at,
        read: data.read,
        status: 'delivered',
        type: 'text'
      };

      return finalMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      return { ...tempMessage, status: 'failed' };
    }
  }, [currentUserId]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!isValidUuid(currentUserId) || messageIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .in('id', messageIds)
        .eq('receiver_id', currentUserId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [currentUserId]);

  return {
    isConnected,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    cleanup
  };
};