import { supabase } from './supabase';
import { EnhancedMessage, MessageStatus } from '../types/messaging';
import { isValidUuid } from '../utils/uuid';

/**
 * Enhanced message service with status tracking and real-time features
 */

export async function sendEnhancedMessage(
  senderId: string,
  receiverId: string,
  content: string,
  type: 'text' | 'image' | 'file' = 'text'
): Promise<EnhancedMessage | null> {
  if (!isValidUuid(senderId) || !isValidUuid(receiverId)) {
    console.warn('sendEnhancedMessage called with invalid UUIDs');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        message_type: type
      })
      .select()
      .single();

    if (error) throw error;

    const message: EnhancedMessage = {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      timestamp: data.created_at,
      read: data.read,
      status: 'delivered',
      type: data.message_type || 'text'
    };

    return message;
  } catch (error) {
    console.error('Error sending enhanced message:', error);
    return null;
  }
}

export async function getEnhancedConversation(
  userId1: string,
  userId2: string,
  limit: number = 50
): Promise<EnhancedMessage[]> {
  if (!isValidUuid(userId1) || !isValidUuid(userId2)) {
    console.warn('getEnhancedConversation called with invalid UUIDs');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((row): EnhancedMessage => ({
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      timestamp: row.created_at,
      read: row.read,
      readAt: row.read_at,
      status: row.read ? 'read' : 'delivered',
      type: row.message_type || 'text'
    }));
  } catch (error) {
    console.error('Error fetching enhanced conversation:', error);
    return [];
  }
}

export async function markMessagesAsReadWithTimestamp(
  currentUserId: string,
  partnerId: string
): Promise<void> {
  if (!isValidUuid(currentUserId) || !isValidUuid(partnerId)) {
    console.warn('markMessagesAsReadWithTimestamp called with invalid UUIDs');
    return;
  }

  try {
    const readTimestamp = new Date().toISOString();
    
    const { error } = await supabase
      .from('messages')
      .update({ 
        read: true,
        read_at: readTimestamp
      })
      .match({
        sender_id: partnerId,
        receiver_id: currentUserId,
        read: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read with timestamp:', error);
  }
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  if (!isValidUuid(userId)) return 0;

  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
}

export async function deleteMessage(messageId: string, userId: string): Promise<boolean> {
  if (!isValidUuid(messageId) || !isValidUuid(userId)) return false;

  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', userId); // Only sender can delete

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

/**
 * Get conversation preview for chat list
 */
export async function getConversationPreviews(userId: string): Promise<{
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}[]> {
  if (!isValidUuid(userId)) return [];

  try {
    // Get latest message for each conversation partner
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender_profile:profiles!messages_sender_id_fkey(name, profile_photo_url),
        receiver_profile:profiles!messages_receiver_id_fkey(name, profile_photo_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by conversation partner and get latest message
    const conversationMap = new Map();
    
    (data || []).forEach((message: any) => {
      const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const partnerProfile = message.sender_id === userId ? message.receiver_profile : message.sender_profile;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partnerName: partnerProfile?.name || 'Anonymous',
          partnerAvatar: partnerProfile?.profile_photo_url || null,
          lastMessage: message.content,
          lastMessageTime: message.created_at,
          unreadCount: 0,
          messages: []
        });
      }
      
      conversationMap.get(partnerId).messages.push(message);
    });

    // Calculate unread counts
    conversationMap.forEach((conversation) => {
      conversation.unreadCount = conversation.messages.filter(
        (msg: any) => msg.receiver_id === userId && !msg.read
      ).length;
    });

    return Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  } catch (error) {
    console.error('Error getting conversation previews:', error);
    return [];
  }
}