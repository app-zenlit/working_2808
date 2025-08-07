'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { PasswordResetScreen } from './PasswordResetScreen';
import { sendSignupOTP, verifySignupOTP, setUserPassword, signInWithPassword, logTelemetry } from '../lib/auth';
import { GradientLogo } from '../components/common/GradientLogo';

interface Props {
  onLogin: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'passwordReset'>('login');
  const [signupStep, setSignupStep] = useState<'email' | 'otp' | 'password' | 'complete'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  // Rate limit storage key
  const RATE_LIMIT_STORAGE_KEY = 'zenlit_rate_limit_end_time';

  // Countdown timer effect for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Rate limit countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (rateLimitCountdown > 0) {
      timer = setTimeout(() => {
        setRateLimitCountdown(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            // Clear rate limit when countdown reaches zero
            try {
              sessionStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
            } catch (error) {
              console.warn('Failed to clear rate limit from sessionStorage:', error);
            }
          }
          return newValue;
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [rateLimitCountdown]);

  // Load rate limit state on component mount
  useEffect(() => {
    try {
      const rateLimitEndTime = sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (rateLimitEndTime) {
        const endTime = parseInt(rateLimitEndTime, 10);
        const currentTime = Date.now();
        const remainingTime = Math.max(0, Math.ceil((endTime - currentTime) / 1000));
        
        if (remainingTime > 0) {
          console.log('Rate limit active, remaining time:', remainingTime, 'seconds');
          setRateLimitCountdown(remainingTime);
        } else {
          // Rate limit has expired, clear it
          sessionStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load rate limit state from sessionStorage:', error);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const recordLoginFailure = (message: string) => {
    setError(message);
    setLoginAttempts(prev => {
      const attempts = prev + 1;
      if (attempts >= 3) {
        setShowFallback(true);
        logTelemetry('login_fallback_reached', { attempts });
      }
      return attempts;
    });
  };

  // Handle rate limit errors
  const handleRateLimitError = (errorMessage: string) => {
    console.log('Rate limit detected, starting cooldown');
    
    // Extract cooldown duration from error message or use default
    let cooldownSeconds = 300; // Default 5 minutes
    
    // Try to extract time from error message
    const timeMatch = errorMessage.match(/(\d+)\s*(minute|second|hour)/i);
    if (timeMatch) {
      const value = parseInt(timeMatch[1], 10);
      const unit = timeMatch[2].toLowerCase();
      
      if (unit.startsWith('minute')) {
        cooldownSeconds = value * 60;
      } else if (unit.startsWith('hour')) {
        cooldownSeconds = value * 3600;
      } else if (unit.startsWith('second')) {
        cooldownSeconds = value;
      }
    }
    
    // Store end time in sessionStorage
    const endTime = Date.now() + (cooldownSeconds * 1000);
    try {
      sessionStorage.setItem(RATE_LIMIT_STORAGE_KEY, endTime.toString());
    } catch (error) {
      console.warn('Failed to store rate limit in sessionStorage:', error);
    }
    
    setRateLimitCountdown(cooldownSeconds);
    setError(`Too many requests. Please wait ${Math.ceil(cooldownSeconds / 60)} minutes before trying again.`);
  };

  // LOGIN FLOW: Existing users with email/password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login for:', formData.email);
      const result = await signInWithPassword(formData.email, formData.password);

      if (result.success) {
        console.log('Login successful');
        setLoginAttempts(0);
        setShowFallback(false);
        await new Promise(resolve => setTimeout(resolve, 500));
        onLogin();
      } else {
        console.error('Login failed:', result.error);
        recordLoginFailure(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      recordLoginFailure('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // SIGNUP STEP 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending OTP for signup to:', formData.email);
      const result = await sendSignupOTP(formData.email);
      
      if (result.success) {
        console.log('OTP sent successfully');
        setSignupStep('otp');
        setOtpCountdown(60); // Start 60 second countdown
      } else {
        console.error('OTP send failed:', result.error);
        
        // Handle rate limit errors specifically
        if (result.error && result.error.includes('rate limit')) {
          handleRateLimitError(result.error);
          return;
        }
        
        // Check if the error indicates an existing account
        if (result.error && result.error.includes('already exists')) {
          // Switch to login view and pre-fill email
          setCurrentView('login');
          setError('An account with this email already exists. Please sign in below.');
        } else {
          setError(result.error || 'Failed to send verification code');
        }
      }
    } catch (error) {
      console.error('OTP send error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // SIGNUP STEP 2: Verify OTP
  const handleVerifyOTP = async () => {
    setError(null);

    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Verifying OTP for:', formData.email);
      const result = await verifySignupOTP(formData.email, formData.otp);
      
      if (result.success) {
        console.log('OTP verified successfully, user authenticated');
        setSignupStep('password');
      } else {
        console.error('OTP verification failed:', result.error);
        setError(result.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // SIGNUP STEP 3: Set password (CRITICAL FOR FUTURE LOGINS)
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Setting password for authenticated user - this will be used for future logins');
      const result = await setUserPassword(formData.password);
      
      if (result.success) {
        console.log('Password set successfully - user can now login with email/password');
        setSignupStep('complete');
        // Auto-proceed to app after a short delay
        setTimeout(() => {
          onLogin();
        }, 2000);
      } else {
        console.error('Password set failed:', result.error);
        setError(result.error || 'Failed to set password');
      }
    } catch (error) {
      console.error('Password set error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (otpCountdown > 0 || rateLimitCountdown > 0) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await sendSignupOTP(formData.email);
      
      if (result.success) {
        setOtpCountdown(60);
        // Clear the OTP field
        setFormData(prev => ({ ...prev, otp: '' }));
      } else {
        // Handle rate limit errors specifically
        if (result.error && result.error.includes('rate limit')) {
          handleRateLimitError(result.error);
        } else {
          setError(result.error || 'Failed to resend code');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchToSignup = () => {
    setCurrentView('signup');
    setSignupStep('email');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      otp: ''
    });
    setError(null);
  };

  const switchToLogin = () => {
    setCurrentView('login');
    setSignupStep('email');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      otp: ''
    });
    setError(null);
  };

  const handleForgotPassword = () => {
    setCurrentView('passwordReset');
  };

  const handleBackFromPasswordReset = () => {
    setCurrentView('login');
  };

  const handleBackButton = () => {
    if (currentView === 'signup') {
      if (signupStep === 'email') {
        setCurrentView('login');
      } else if (signupStep === 'otp') {
        setSignupStep('email');
      } else if (signupStep === 'password') {
        setSignupStep('otp');
      }
    }
    setError(null);
  };

  const handleRetryInBrowser = () => {
    logTelemetry('login_fallback_retry_browser');
    window.open(window.location.href, '_blank');
  };

  const handleContactSupport = () => {
    logTelemetry('login_fallback_contact_support');
    window.location.href = 'mailto:support@zenlit.com';
  };

  const handleCancelFallback = () => {
    logTelemetry('login_fallback_cancel');
    setShowFallback(false);
    setLoginAttempts(0);
  };

  // Show password reset screen
  if (currentView === 'passwordReset') {
    return <PasswordResetScreen onBack={handleBackFromPasswordReset} />;
  }

  return (
    <div className="auth-screen mobile-screen bg-black">
      <motion.div
        className="mobile-full-height flex items-center justify-center p-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6 pt-4">
            {/* Back Button */}
            {currentView === 'signup' && (
              <div className="flex items-center justify-start mb-4">
                <button
                  onClick={handleBackButton}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span className="text-sm">Back</span>
                </button>
              </div>
            )}
            
            <div className="mb-2">
              <GradientLogo size="lg" />
            </div>
            <p className="text-gray-400">Connect with people around you</p>
          </div>

          {/* Login/Signup Form */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white text-center">
                {currentView === 'login' ? 'Welcome Back' : 
                 signupStep === 'email' ? 'Create Account' :
                 signupStep === 'otp' ? 'Verify Email' :
                 signupStep === 'password' ? 'Set Your Password' :
                 'Account Created!'}
              </h2>
              <p className="text-gray-400 text-center mt-2">
                {currentView === 'login' ? 'Sign in with your email and password' : 
                 signupStep === 'email' ? 'Enter your email to get started' :
                 signupStep === 'otp' ? `We sent a code to ${formData.email}` :
                 signupStep === 'password' ? 'This password will be used for future logins' :
                 'Welcome to Zenlit!'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-700 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* LOGIN FORM */}
            {currentView === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            )}

            {/* SIGNUP FORMS */}
            {currentView === 'signup' && (
              <>
                {/* STEP 1: Email */}
                {signupStep === 'email' && (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || rateLimitCountdown > 0}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending Code...
                        </>
                      ) : rateLimitCountdown > 0 ? (
                        `Wait ${Math.ceil(rateLimitCountdown / 60)} min ${rateLimitCountdown % 60}s`
                      ) : (
                        'Send Verification Code'
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 2: OTP Verification */}
                {signupStep === 'otp' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        value={formData.otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          handleInputChange('otp', value);
                        }}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest text-lg"
                        placeholder="000000"
                        maxLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the 6-digit code sent to your email
                      </p>
                    </div>

                    <button
                      onClick={handleVerifyOTP}
                      disabled={isLoading || formData.otp.length !== 6}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </button>

                    <div className="text-center">
                      <p className="text-gray-400 text-sm">
                        Didn&apos;t receive the code?{' '}
                        <button
                          onClick={handleResendOTP}
                          disabled={otpCountdown > 0 || isLoading || rateLimitCountdown > 0}
                          className="text-blue-400 hover:text-blue-300 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                          {rateLimitCountdown > 0 
                            ? `Wait ${Math.ceil(rateLimitCountdown / 60)}m ${rateLimitCountdown % 60}s`
                            : otpCountdown > 0 
                            ? `Resend in ${otpCountdown}s` 
                            : 'Resend Code'
                          }
                        </button>
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 3: Set Password (CRITICAL FOR FUTURE LOGINS) */}
                {signupStep === 'password' && (
                  <form onSubmit={handleSetPassword} className="space-y-4">
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-green-400 text-sm font-medium">
                          Email verified successfully!
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mb-4">
                      <p className="text-blue-300 text-sm">
                        <strong>Important:</strong> This password will be used for all future logins to your account.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Create Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                          placeholder="Create a secure password"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                          placeholder="Confirm your password"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Setting Password...
                        </>
                      ) : (
                          "Set Password & Complete Signup"
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 4: Complete */}
                {signupStep === 'complete' && (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Account Created!</h3>
                    <p className="text-gray-400">
                      Your account has been successfully created with password authentication. You can now sign in anytime using your email and password.
                    </p>
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                )}
              </>
            )}

            {/* Toggle between login/signup */}
            {signupStep === 'email' && (
              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  {currentView === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={currentView === 'login' ? switchToSignup : switchToLogin}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    {currentView === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Terms and Privacy */}
          {signupStep === 'email' && (
            <div className="mt-6 text-center pb-8">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our{' '}
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </button>
              </p>
            </div>
          )}
        </div>
      </motion.div>
      {showFallback && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center max-w-sm w-full">
            <p className="text-gray-300 mb-4">
              We&apos;re having trouble verifying your connection. For your safety, please retry in the browser.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleRetryInBrowser}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry in browser
              </button>
              <button
                onClick={handleContactSupport}
                className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Contact support
              </button>
              <button
                onClick={handleCancelFallback}
                className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};