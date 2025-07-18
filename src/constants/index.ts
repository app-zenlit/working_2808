// Application constants
export const APP_CONFIG = {
  NAME: 'Zenlit',
  DESCRIPTION: 'Connect with people around you and build meaningful local connections',
  VERSION: '1.0.0',
  AUTHOR: 'Zenlit Team',
} as const;

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-z0-9._]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
  },
  BIO: {
    MAX_LENGTH: 200,
  },
  CAPTION: {
    MAX_LENGTH: 500,
  },
  DISPLAY_NAME: {
    MAX_LENGTH: 50,
  },
  FEEDBACK: {
    MAX_LENGTH: 1000,
  },
} as const;

export const FILE_LIMITS = {
  PROFILE_IMAGE: {
    MAX_SIZE_MB: 5,
    FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  },
  BANNER_IMAGE: {
    MAX_SIZE_MB: 10,
    FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  },
  POST_IMAGE: {
    MAX_SIZE_MB: 10,
    FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
    COMPRESSION: {
      minSizeKB: 350,
      maxSizeKB: 800,
      maxWidth: 1920,
      maxHeight: 1920,
    } as const,
  },
} as const;

export const STORAGE_KEYS = {
  LOCATION_TOGGLE: 'zenlit_location_toggle_enabled',
  PWA_INSTALL_DISMISSED: 'pwa-install-dismissed',
  IOS_INSTALL_DISMISSED: 'ios-install-banner-dismissed',
} as const;

export const SOCIAL_PLATFORMS = {
  INSTAGRAM: {
    id: 'instagram' as const,
    name: 'Instagram',
    placeholder: 'https://instagram.com/yourusername',
    color: 'pink',
  },
  LINKEDIN: {
    id: 'linkedin' as const,
    name: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/yourprofile',
    color: 'blue',
  },
  TWITTER: {
    id: 'twitter' as const,
    name: 'X (Twitter)',
    placeholder: 'https://twitter.com/yourusername',
    color: 'gray',
  },
} as const;

export const LOCATION_CONFIG = {
  COORDINATE_PRECISION: 2, // Decimal places for privacy
  UPDATE_INTERVAL_MS: 60000, // 60 seconds
  TIMEOUT_MS: 30000, // 30 seconds
  MAX_AGE_MS: 60000, // 1 minute cache
  STALE_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutes
} as const;

export const UI_CONFIG = {
  PULL_TO_REFRESH_THRESHOLD: 80,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  OTP_LENGTH: 6,
  OTP_RESEND_COUNTDOWN: 60,
} as const;