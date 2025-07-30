import { useEffect, useState } from 'react';
import { User, Post } from '../types';
import { UserProfile } from '../components/profile/UserProfile';
import { PostsGalleryScreen } from './PostsGalleryScreen';
import { ChevronLeftIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { getUserPosts } from '../lib/posts';
import { useRouter } from 'next/navigation';

interface Props {
  user: User;
  onBack?: () => void;
  onEditProfile?: (platform?: string) => void;
  onLogout?: () => void;
  isCurrentUser?: boolean;
}

export const UserProfileScreen: React.FC<Props> = ({
  user,
  onBack,
  onEditProfile,
  onLogout,
  isCurrentUser = false,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      const loaded = await getUserPosts(user.id);
      setPosts(loaded);
      setIsLoading(false);
    };
    loadPosts();
  }, [user]);

  const handleFeedbackClick = () => {
    setShowMenu(false);
    router.push('/feedback');
  };

  if (showGallery) {
    return (
      <PostsGalleryScreen
        user={user}
        posts={posts}
        onBack={() => setShowGallery(false)}
        onUserClick={() => {}}
      />
    );
  }

  return (
    <div className="min-h-full bg-black">
      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-4 left-4 z-50 bg-gray-900/80 backdrop-blur-sm p-3 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
      )}
      {(onEditProfile || onLogout) && (
        <div className="fixed top-4 right-4 z-50">
          <div className="relative">
            <button
              onClick={() => setShowMenu((m) => !m)}
              className="p-3 bg-gray-900/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-800 active:scale-95 transition-all"
            >
              <Bars3Icon className="w-5 h-5 text-white" />
            </button>
            {showMenu && (
              <div className="absolute top-full right-0 mt-2 bg-gray-800 rounded-lg shadow-lg py-1 min-w-[120px]">
                {onEditProfile && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEditProfile();
                    }}
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                  >
                    Edit Profile
                  </button>
                )}
                <button
                  onClick={handleFeedbackClick}
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                >
                  Feedback
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onLogout();
                    }}
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {isLoading ? (
        <div className="min-h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      ) : (
        <UserProfile
          user={user}
          posts={posts}
          onPostClick={() => setShowGallery(true)}
          isCurrentUser={isCurrentUser}
          onAddSocialLink={(platform) => onEditProfile?.(platform)}
        />
      )}
    </div>
  );
};