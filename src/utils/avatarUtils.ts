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
export const avatarIcons = [
  UserIcon,
  PhotoIcon,
  FaceSmileIcon,
  HeartIcon,
  StarIcon,
  SparklesIcon,
  SunIcon,
  MoonIcon
];

// Generate a consistent random icon based on user name or identifier
export const getRandomIcon = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % avatarIcons.length;
  return avatarIcons[index];
};

// Check if a profile photo URL is valid (not null, empty, or a placeholder)
export const isValidProfilePhotoUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  if (url.trim() === '') return false;
  if (url.includes('/images/default-avatar')) return false;
  if (url.includes('default-avatar.png')) return false;
  if (url.includes('placeholder')) return false;
  return true;
};