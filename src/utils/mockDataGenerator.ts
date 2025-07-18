import { Post } from '../types';

/**
 * Utility functions for post data validation and sorting
 * Note: Mock data generation removed - app uses real Supabase data
 */

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

export function filterValidPosts(posts: Post[]): Post[] {
  return posts.filter(validatePostData);
}

export function groupPostsByUser(posts: Post[]): Record<string, Post[]> {
  return posts.reduce((acc, post) => {
    if (!acc[post.userId]) {
      acc[post.userId] = [];
    }
    acc[post.userId].push(post);
    return acc;
  }, {} as Record<string, Post[]>);
}