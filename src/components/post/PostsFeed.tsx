import React from 'react';
import { Post } from '../../types';
import { 
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

interface Props {
  posts: Post[];
  onUserClick?: (userId: string) => void;
}

export const PostsFeed: React.FC<Props> = ({ posts, onUserClick }) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        (() => {
          // Get the random icon component for this user
          const IconComponent = getRandomIcon(post.userName);
          
          return (
        <div key={post.id} className="bg-gray-900 rounded-lg overflow-hidden">
          {/* Clickable header area - optimized */}
          <button
            onClick={() => onUserClick?.(post.userId)}
            className="w-full px-3 py-2 flex items-center space-x-2 hover:bg-gray-800 active:bg-gray-700 transition-colors text-left"
          >
            {post.userDpUrl ? (
              <img
                src={post.userDpUrl}
                alt={post.userName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors">
                <IconComponent className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <h3 className="font-medium text-base">{post.userName}</h3>
          </button>

          {post.mediaUrl ? (
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="w-full aspect-video object-cover"
            />
          ) : (
            <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          <div className="p-3">
            <p className="text-gray-300">{post.caption}</p>
          </div>
        </div>
          );
        })()
      ))}
    </div>
  );
};