import type React from 'react';

// Re-export auth types
export type { AuthResponse } from './utils/auth';

export interface User {
  id: string;
  name: string;
  username?: string; // Added username field
  dpUrl: string;
  bio: string;
  gender: 'male' | 'female';
  age: number;
  distance: number;
  links: {
    Twitter: string;
    Instagram: string;
    LinkedIn: string;
  };
  // Location fields
  latitude?: number;
  longitude?: number;
  // Cover photo field
  coverPhotoUrl?: string;
  // Social media URL fields (removed verified fields)
  instagramUrl?: string;
  linkedInUrl?: string;
  twitterUrl?: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userDpUrl: string;
  title: string;
  mediaUrl: string;
  caption: string;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Media {
  id: string;
  mediaUrl: string;
  caption?: string;
  timestamp: string;
}

export interface CurrentUser extends User {
  posterUrl: string;
  email: string;
  media: Media[];
  messages: Message[];
  posts: Post[];
}

export type SocialPlatformId = 'instagram' | 'linkedin' | 'twitter';

export interface SocialProvider {
  id: SocialPlatformId;
  name: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  placeholder: string;
}

export interface LocationPermissionStatus {
  granted: boolean;
  denied: boolean;
  pending: boolean;
  error?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isValid: boolean;
  isDirty: boolean;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Storage types
export interface StorageUploadResult {
  publicUrl: string | null;
  error: string | null;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps {
  loading?: boolean;
  disabled?: boolean;
}