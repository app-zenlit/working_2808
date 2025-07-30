import { supabase, ensureSession } from './supabase'

export interface AuthResponse {
  success: boolean
  error?: string
  data?: any
}

// Check if Supabase is available
const isSupabaseAvailable = () => {
  if (!supabase) {
    console.error('Supabase client not initialized. Check environment variables.')
    return false
  }
  return true
}

// STEP 1: Send OTP for email verification during signup
export const sendSignupOTP = async (email: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Sending signup OTP to:', email)
    
    const { data, error } = await supabase!.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true, // Creates user if they don't exist
        data: {
          signup_flow: true // CRITICAL FLAG - marks user as still in signup process
        }
      }
    })

    if (error) {
      console.error('OTP send error:', error.message)
      
      // Handle specific Supabase errors
      if (error.message.includes('User already registered')) {
        return { 
          success: false, 
          error: 'An account with this email already exists. Please sign in instead or use "Forgot password?" if you need to reset your password.' 
        }
      }
      
      if (error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          error: 'An account with this email already exists but is not verified. Please check your email for the verification link or contact support.' 
        }
      }
      
      if (error.message.includes('rate limit')) {
        return { 
          success: false, 
          error: 'Too many requests. Please wait before requesting another code.' 
        }
      }
      
      return { success: false, error: error.message }
    }

    console.log('Signup OTP sent successfully')
    return { success: true, data }
  } catch (error) {
    console.error('OTP send catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send verification code' 
    }
  }
}

// STEP 2: Verify OTP and get authenticated session
export const verifySignupOTP = async (email: string, token: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Verifying signup OTP for:', email)
    
    const { data, error } = await supabase!.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token,
      type: 'email'
    })

    if (error) {
      console.error('OTP verify error:', error.message)
      
      if (error.message.includes('expired')) {
        return { 
          success: false, 
          error: 'Verification code has expired. Please request a new one.' 
        }
      }
      
      if (error.message.includes('invalid')) {
        return { 
          success: false, 
          error: 'Invalid verification code. Please check and try again.' 
        }
      }
      
      return { success: false, error: error.message }
    }

    if (!data.user || !data.session) {
      return { success: false, error: 'Verification failed. Please try again.' }
    }

    // Ensure session is properly stored
    if (data.session) {
      await supabase!.auth.setSession(data.session)
    }

    console.log('OTP verified successfully, user created:', data.user.id)
    console.log('User still in signup flow - signup_flow flag:', data.user.user_metadata?.signup_flow)
    return { success: true, data }
  } catch (error) {
    console.error('OTP verify catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to verify code' 
    }
  }
}

// STEP 3: Set password for the authenticated user
export const setUserPassword = async (password: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Setting password for authenticated user - this will be used for future logins')
    
    // Ensure we have a valid session first
    const sessionResult = await ensureSession()
    if (!sessionResult.success) {
      return { success: false, error: 'Please verify your email first' }
    }

    // Update user password
    const { data, error } = await supabase!.auth.updateUser({
      password: password
    })

    if (error) {
      console.error('Password set error:', error.message)
      
      if (error.message.includes('Password should be at least')) {
        return { 
          success: false, 
          error: 'Password must be at least 6 characters long.' 
        }
      }
      
      return { success: false, error: error.message }
    }

    // CRITICAL: Clear the signup_flow flag after password is set
    console.log('Password set successfully, clearing signup_flow flag...')
    const { error: metadataError } = await supabase!.auth.updateUser({
      data: { signup_flow: false }
    })

    if (metadataError) {
      console.error('Failed to clear signup_flow flag:', metadataError)
      // Don't fail the whole operation for this
    } else {
      console.log('Signup flow flag cleared - user can now proceed to profile setup')
    }

    // Ensure session is maintained after password update
    if (data.user) {
      const { data: sessionData } = await supabase!.auth.getSession()
      if (sessionData.session) {
        await supabase!.auth.setSession(sessionData.session)
      }
    }

    console.log('Password set successfully for user:', data.user?.id)
    return { success: true, data }
  } catch (error) {
    console.error('Password set catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to set password' 
    }
  }
}

// STEP 4: Complete profile setup
export const completeProfileSetup = async (profileData: {
  fullName: string
  username: string // Now required
  bio?: string
  dateOfBirth?: string
  gender?: string
  profilePhotoUrl?: string
  instagramUrl?: string
  linkedInUrl?: string
  twitterUrl?: string
}): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Completing profile setup')
    
    // Ensure we have a valid session
    const sessionResult = await ensureSession()
    if (!sessionResult.success) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data: sessionData, error } = await supabase.auth.getSession();
    
    if (error || !sessionData.session) {
      throw new Error("No active session found");
    }
    
    const user = sessionData.session.user;

    // Validate required fields
    if (!profileData.fullName.trim()) {
      return { success: false, error: 'Display name is required' }
    }

    if (!profileData.username.trim()) {
      return { success: false, error: 'Username is required' }
    }

    // Create/update profile
    const { data: profile, error: profileError } = await supabase!
      .from('profiles')
      .upsert({
        id: user.id,
        name: profileData.fullName.trim(),
        username: profileData.username.trim().toLowerCase(),
        email: user.email, // Explicitly add email from authenticated user
        bio: profileData.bio || 'New to Zenlit! 👋',
        date_of_birth: profileData.dateOfBirth,
        gender: profileData.gender,
        profile_photo_url: profileData.profilePhotoUrl,
        profile_completed: true,
        instagram_url: profileData.instagramUrl || null,
        linked_in_url: profileData.linkedInUrl || null,
        twitter_url: profileData.twitterUrl || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile setup error:', profileError)
      
      // Handle specific database errors
      if (profileError.code === '23505') {
        return { success: false, error: 'Username is already taken. Please choose a different one.' }
      }
      
      return { success: false, error: 'Failed to save profile. Please try again.' }
    }

    console.log('Profile setup completed successfully')
    return { success: true, data: profile }
  } catch (error) {
    console.error('Profile setup catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete profile setup' 
    }
  }
}

// LOGIN: Password-based login for existing users
export const signInWithPassword = async (email: string, password: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Attempting password login for:', email)
    
    const { data, error } = await supabase!.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password
    })

    if (error) {
      console.error('Password login error:', error.message)
      
      if (error.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          error: 'Invalid email or password. Please check your credentials and try again.' 
        }
      }
      
      if (error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          error: 'Please verify your email address first by clicking the link in your email.' 
        }
      }
      
      if (error.message.includes('Too many requests')) {
        return { 
          success: false, 
          error: 'Too many login attempts. Please wait and try again.' 
        }
      }
      
      return { success: false, error: error.message }
    }

    if (!data.user || !data.session) {
      return { success: false, error: 'Login failed. Please try again.' }
    }

    // Ensure session is properly stored
    await supabase!.auth.setSession(data.session)

    console.log('Password login successful for user:', data.user.id)
    return { success: true, data }
  } catch (error) {
    console.error('Password login catch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign in'
    }
  }
}

// Utility: check if account requires password reset due to failed logins
export const checkResetRequired = async (email: string): Promise<boolean> => {
  if (!isSupabaseAvailable()) {
    return false
  }

  try {
    const { data, error } = await supabase!
      .from('profiles')
      .select('reset_required')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (error) {
      console.error('Failed to fetch reset_required flag:', error.message)
      return false
    }

    return data?.reset_required === true
  } catch (err) {
    console.error('Check reset_required catch error:', err)
    return false
  }
}

// Utility: update the reset_required flag for a user
export const updateResetRequired = async (
  email: string,
  value: boolean
): Promise<void> => {
  if (!isSupabaseAvailable()) {
    return
  }

  try {
    const { error } = await supabase!
      .from('profiles')
      .update({ reset_required: value })
      .eq('email', email.trim().toLowerCase())

    if (error) {
      console.error('Failed to update reset_required flag:', error.message)
    }
  } catch (err) {
    console.error('Update reset_required catch error:', err)
  }
}

// PASSWORD RESET FLOW: OTP-based password reset (NO AUTO LOGIN)

// RESET STEP 1: Send OTP for password reset
export const sendPasswordResetOTP = async (email: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Sending password reset OTP to:', email)
    
    // Use resetPasswordForEmail instead of signInWithOtp to avoid auto-login
    const { error } = await supabase!.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password-confirm`
      }
    )

    if (error) {
      console.error('Password reset OTP send error:', error.message)
      
      if (error.message.includes('User not found')) {
        return { 
          success: false, 
          error: 'No account found with this email address. Please check your email or sign up for a new account.' 
        }
      }
      
      if (error.message.includes('rate limit')) {
        return { 
          success: false, 
          error: 'Too many requests. Please wait before requesting another code.' 
        }
      }
      
      return { success: false, error: error.message }
    }

    console.log('Password reset email sent successfully')
    return { success: true }
  } catch (error) {
    console.error('Password reset OTP send catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send reset code' 
    }
  }
}

// RESET STEP 2: Verify OTP for password reset (TEMPORARY SESSION ONLY)
export const verifyPasswordResetOTP = async (email: string, token: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Verifying password reset OTP for:', email)
    
    // Use verifyOtp with type 'recovery' for password reset
    const { data, error } = await supabase!.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token,
      type: 'recovery' // Use 'recovery' type for password reset
    })

    if (error) {
      console.error('Password reset OTP verify error:', error.message)
      
      if (error.message.includes('expired')) {
        return { 
          success: false, 
          error: 'Verification code has expired. Please request a new one.' 
        }
      }
      
      if (error.message.includes('invalid')) {
        return { 
          success: false, 
          error: 'Invalid verification code. Please check and try again.' 
        }
      }
      
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Verification failed. Please try again.' }
    }

    // IMPORTANT: We have a temporary session for password reset only
    // This session will be used ONLY to set the new password
    console.log('Password reset OTP verified successfully for user:', data.user.id)
    console.log('Temporary session created for password reset only')
    
    return { success: true, data }
  } catch (error) {
    console.error('Password reset OTP verify catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to verify code' 
    }
  }
}

// RESET STEP 3: Set new password and SIGN OUT (NO AUTO LOGIN)
export const setNewPassword = async (newPassword: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Setting new password for user - will sign out after setting password')
    
    // Ensure we have a valid session first
    const sessionResult = await ensureSession()
    if (!sessionResult.success) {
      return { success: false, error: 'Please verify your email first' }
    }

    // Update user password
    const { data, error } = await supabase!.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('New password set error:', error.message)
      
      if (error.message.includes('Password should be at least')) {
        return { 
          success: false, 
          error: 'Password must be at least 6 characters long.' 
        }
      }
      
      return { success: false, error: error.message }
    }

    console.log('New password set successfully for user:', data.user?.id)
    
    // CRITICAL: Sign out the user immediately after setting password
    // This ensures they must log in with their new password
    console.log('Signing out user - they must log in with new password')
    
    const { error: signOutError } = await supabase!.auth.signOut()
    
    if (signOutError) {
      console.error('Sign out error after password reset:', signOutError)
      // Don't fail the operation if sign out fails
    } else {
      console.log('User signed out successfully after password reset')
    }

    return { success: true, data: { passwordReset: true, mustSignIn: true } }
  } catch (error) {
    console.error('New password set catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to set new password' 
    }
  }
}

// FORGOT PASSWORD: Send reset email (DEPRECATED - use OTP flow instead)
export const sendPasswordReset = async (email: string): Promise<AuthResponse> => {
  // Redirect to OTP-based flow
  return await sendPasswordResetOTP(email)
}

// UTILITY: Sign out
export const signOut = async (): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    // Attempt to clear stored location data before signing out
    const { data: { user } } = await supabase!.auth.getUser()
    if (user) {
      const { error: updateError } = await supabase!
        .from('profiles')
        .update({
          latitude: null,
          longitude: null,
          location_last_updated_at: null
        })
        .eq('id', user.id)
      if (updateError) {
        console.error('Failed to clear location on logout:', updateError.message)
      }
    }

    const { error } = await supabase!.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error.message)
      return { success: false, error: error.message }
    }

    console.log('User signed out successfully')
    return { success: true }
  } catch (error) {
    console.error('Sign out catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign out' 
    }
  }
}

// UTILITY: Check current session (enhanced)
export const checkSession = async (): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    const sessionResult = await ensureSession()
    return sessionResult
  } catch (error) {
    console.error('Session check catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check session' 
    }
  }
}

// UTILITY: Get current user
export const getCurrentUser = async (): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    const { data: { user }, error } = await supabase!.auth.getUser()
    
    if (error) {
      console.error('Get user error:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data: user }
  } catch (error) {
    console.error('Get user catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get user' 
    }
  }
}

// UTILITY: Handle refresh token errors
export const handleRefreshTokenError = async (): Promise<void> => {
  try {
    console.log('Handling refresh token error - signing out user')
    await supabase!.auth.signOut()
    
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token')
    sessionStorage.clear()
    
    // Reload the page to reset app state
    window.location.reload()
  } catch (error) {
    console.error('Error handling refresh token error:', error)
    // Force reload anyway
    window.location.reload()
  }
}