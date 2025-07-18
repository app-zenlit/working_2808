import { Message } from '../types';

/**
 * Utility functions for managing message data
 * Note: All mock data generation has been removed - app uses real Supabase data
 */

export function getMessagesForUsers(currentUserId: string, messages: Message[], userId: string): Message[] {
  return messages.filter(msg => 
    (msg.senderId === currentUserId && msg.receiverId === userId) ||
    (msg.senderId === userId && msg.receiverId === currentUserId)
  );
}

export function getLatestMessageForUser(messages: Message[], userId: string): Message | undefined {
  return messages
    .filter(msg => msg.senderId === userId || msg.receiverId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    [0];
}