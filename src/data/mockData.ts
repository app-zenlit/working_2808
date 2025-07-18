// This file now only contains utility functions for managing real data
import { Message } from '../types';

// Note: All mock data generation has been removed
// The app now only uses real data from Supabase database

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
    .shift();
}