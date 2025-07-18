// This file has been cleaned up to remove all mock data generation
// The app now only uses real data from Supabase

import { Post } from '../types';

// Note: All mock data generation functions have been removed
// Posts are now only loaded from the Supabase database

export function validatePostData(post: Post): boolean {
  return !!(
    post.id &&
    post.userId &&
    post.userName &&
    post.mediaUrl &&
    post.caption &&
    post.timestamp
  );
}

export function sortPostsByDate(posts: Post[]): Post[] {
  return posts.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}