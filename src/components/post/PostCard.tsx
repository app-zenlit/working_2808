import Image from 'next/image';
import React from 'react';
import { Post } from '../../types';
import { getRandomIcon, isValidProfilePhotoUrl } from '../../utils/avatarUtils';

interface Props {
  post: Post;
  onUserClick?: () => void;
}

export const PostCard: React.FC<Props> = ({ post, onUserClick }) => {
  // Get the random icon component for this user
  const IconComponent = getRandomIcon(post.userName);

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Clickable header area - optimized */}
      <button
        onClick={onUserClick}
        className="w-full px-3 py-2 flex items-center space-x-2 hover:bg-gray-800 active:bg-gray-700 transition-colors text-left"
      >
        {isValidProfilePhotoUrl(post.userDpUrl) ? (
          <Image
            src={post.userDpUrl}
            alt={post.userName}
            width={32}
            height={32}
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
        <Image
          src={post.mediaUrl}
          alt={post.title}
          width={400}
          height={300}
          className="w-full aspect-video object-cover"
        />
      ) : (
        <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
          <span className="text-gray-400">No image</span>
        </div>
      )}
      
      <div className="p-3">
        <p className="text-gray-200">{post.caption}</p>
      </div>
    </div>
  );
};