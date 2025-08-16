import { EnhancedMessage } from '../types/messaging';

/**
 * Utility functions for message processing and formatting
 */

export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } else if (diffInHours < 168) { // 7 days
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const groupMessagesByDate = (messages: EnhancedMessage[]): {
  date: string;
  messages: EnhancedMessage[];
}[] => {
  const groups: { [key: string]: EnhancedMessage[] } = {};

  messages.forEach(message => {
    const date = new Date(message.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });

  return Object.entries(groups).map(([date, msgs]) => ({
    date,
    messages: msgs
  }));
};

export const shouldShowTimestamp = (
  currentMessage: EnhancedMessage,
  previousMessage?: EnhancedMessage
): boolean => {
  if (!previousMessage) return true;

  const currentTime = new Date(currentMessage.timestamp);
  const previousTime = new Date(previousMessage.timestamp);
  const diffInMinutes = (currentTime.getTime() - previousTime.getTime()) / (1000 * 60);

  return diffInMinutes > 5; // Show timestamp if more than 5 minutes apart
};

export const shouldGroupMessages = (
  currentMessage: EnhancedMessage,
  previousMessage?: EnhancedMessage
): boolean => {
  if (!previousMessage) return false;

  const isSameSender = currentMessage.senderId === previousMessage.senderId;
  const currentTime = new Date(currentMessage.timestamp);
  const previousTime = new Date(previousMessage.timestamp);
  const diffInMinutes = (currentTime.getTime() - previousTime.getTime()) / (1000 * 60);

  return isSameSender && diffInMinutes < 2; // Group if same sender and within 2 minutes
};

export const truncateMessage = (content: string, maxLength: number = 50): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

export const getMessagePreview = (message: EnhancedMessage): string => {
  switch (message.type) {
    case 'image':
      return '📷 Photo';
    case 'file':
      return `📎 ${message.metadata?.fileName || 'File'}`;
    default:
      return truncateMessage(message.content, 40);
  }
};

export const validateMessageContent = (content: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!content.trim()) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  if (content.length > 1000) {
    return { isValid: false, error: 'Message too long (max 1000 characters)' };
  }

  return { isValid: true };
};