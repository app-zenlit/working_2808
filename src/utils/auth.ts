import { supabase } from '../lib/supabase';
import { validateEmailField, validatePassword, validateOTP } from './validation';
import { getErrorMessage } from './common';

/**
 * Centralized authentication utilities
 */

export interface AuthResponse {
  success: boolean;
  error?: string;
  data?: any;
}

// Common error handling for auth operations
export const handleAuthError = (error: any, context: string): string => {
  console.error(`${context} error:`, error);
  
  if (error.message.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead or use "Forgot password?" if you need to reset your password.';
  }
  
  if (error.message.includes('Email not confirmed')) {
    return 'An account with this email already exists but is not verified. Please check your email for the verification link or contact support.';
  }
  
  if (error.message.includes('rate limit')) {
    return 'Too many requests. Please wait before requesting another code.';
  }
  
  if (error.message.includes('expired')) {
    return 'Verification code has expired. Please request a new one.';
  }
  
  if (error.message.includes('invalid')) {
    return 'Invalid verification code. Please check and try again.';
  }
  
  if (error.message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  if (error.message.includes('Too many requests')) {
    return 'Too many login attempts. Please wait and try again.';
  }
  
  if (error.message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  
  return getErrorMessage(error);
};

// Validate input before making auth requests
export const validateAuthInput = (
  email?: string,
  password?: string,
  otp?: string
): { valid: boolean; error?: string } => {
  if (email) {
    const emailValidation = validateEmailField(email);
    if (!emailValidation.valid) {
      return emailValidation;
    }
  }
  
  if (password) {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return passwordValidation;
    }
  }
  
  if (otp) {
    const otpValidation = validateOTP(otp);
    if (!otpValidation.valid) {
      return otpValidation;
    }
  }
  
  return { valid: true };
};

// Generic auth operation wrapper
export const executeAuthOperation = async (
  operation: () => Promise<any>,
  context: string
): Promise<AuthResponse> => {
  if (!supabase) {
    console.error('Supabase client not initialized. Check environment variables.');
    return { success: false, error: 'Service temporarily unavailable' };
  }

  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: handleAuthError(error, context)
    };
  }
};