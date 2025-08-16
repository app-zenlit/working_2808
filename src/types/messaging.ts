/**
 * Enhanced messaging types for real-time features
 */

export interface MessageStatus {
  id: string;
  messageId: string;
  status: 'sending' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  readAt?: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: number;
}

export interface EnhancedMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  status: 'sending' | 'delivered' | 'read' | 'failed';
  readAt?: string;
  type: 'text' | 'image' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface ChatSession {
  id: string;
  participants: string[];
  lastActivity: string;
  typingUsers: TypingIndicator[];
  unreadCount: number;
}

export interface RealtimeSubscription {
  channel: any;
  isConnected: boolean;
  lastHeartbeat: number;
}