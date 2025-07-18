import { VALIDATION_RULES } from '../constants';
import { validateEmail, validateRequired, validateLength } from './common';

/**
 * Centralized validation functions for forms
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Username validation
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  const requiredError = validateRequired(username, 'Username');
  if (requiredError) return { valid: false, error: requiredError };

  const lengthError = validateLength(
    username, 
    VALIDATION_RULES.USERNAME.MIN_LENGTH, 
    VALIDATION_RULES.USERNAME.MAX_LENGTH, 
    'Username'
  );
  if (lengthError) return { valid: false, error: lengthError };

  if (!VALIDATION_RULES.USERNAME.PATTERN.test(username)) {
    return { valid: false, error: 'Username can only contain lowercase letters, numbers, dots, and underscores' };
  }

  if (username.startsWith('.') || username.startsWith('_') || 
      username.endsWith('.') || username.endsWith('_')) {
    return { valid: false, error: 'Username cannot start or end with dots or underscores' };
  }

  if (username.includes('..') || username.includes('__') || 
      username.includes('._') || username.includes('_.')) {
    return { valid: false, error: 'Username cannot have consecutive special characters' };
  }

  return { valid: true };
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  const requiredError = validateRequired(password, 'Password');
  if (requiredError) return { valid: false, error: requiredError };

  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long` };
  }

  return { valid: true };
};

// Email validation
export const validateEmailField = (email: string): { valid: boolean; error?: string } => {
  const requiredError = validateRequired(email, 'Email');
  if (requiredError) return { valid: false, error: requiredError };

  if (!validateEmail(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
};

// Profile validation
export const validateProfile = (data: {
  displayName: string;
  username: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Display name validation
  const nameError = validateRequired(data.displayName, 'Display name');
  if (nameError) errors.displayName = nameError;

  const nameLengthError = validateLength(
    data.displayName, 
    1, 
    VALIDATION_RULES.DISPLAY_NAME.MAX_LENGTH, 
    'Display name'
  );
  if (nameLengthError) errors.displayName = nameLengthError;

  // Username validation
  const usernameValidation = validateUsername(data.username);
  if (!usernameValidation.valid) {
    errors.username = usernameValidation.error!;
  }

  // Bio validation
  if (data.bio.length > VALIDATION_RULES.BIO.MAX_LENGTH) {
    errors.bio = `Bio must be ${VALIDATION_RULES.BIO.MAX_LENGTH} characters or less`;
  }

  // Date of birth validation
  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  }

  // Gender validation
  if (!data.gender) {
    errors.gender = 'Gender is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Login validation
export const validateLogin = (email: string, password: string): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailValidation = validateEmailField(email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error!;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error!;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// OTP validation
export const validateOTP = (otp: string): { valid: boolean; error?: string } => {
  const requiredError = validateRequired(otp, 'Verification code');
  if (requiredError) return { valid: false, error: requiredError };

  if (otp.length !== VALIDATION_RULES.USERNAME.MIN_LENGTH * 2) { // 6 digits
    return { valid: false, error: 'Please enter a valid 6-digit code' };
  }

  return { valid: true };
};