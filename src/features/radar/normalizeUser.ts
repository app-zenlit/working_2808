export interface RadarUser {
  id: string;
  name: string;
  username?: string | null;
  bio: string;
  profile_photo_url: string;
  cover_photo_url: string;
  instagram_url: string;
  linked_in_url: string;
  twitter_url: string;
  interests: string[];
  // Allow additional properties like location or other profile data
  [key: string]: any;
}

export const normalizeUser = (profile: any): RadarUser => {
  return {
    ...profile,
    bio: profile?.bio ?? '',
    profile_photo_url: profile?.profile_photo_url ?? '',
    cover_photo_url: profile?.cover_photo_url ?? '',
    instagram_url: profile?.instagram_url ?? '',
    linked_in_url: profile?.linked_in_url ?? '',
    twitter_url: profile?.twitter_url ?? '',
    interests: Array.isArray(profile?.interests) ? profile.interests : [],
  };
};
