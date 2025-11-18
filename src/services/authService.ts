import { supabase } from '@/lib/supabase';
import type { AuthUser } from '@/types/database';
import type { AuthChangeEvent, Session, User, AuthError } from '@supabase/supabase-js';

// OAuth Provider Types
type OAuthProvider = 'google' | 'github' | 'kakao';

// Auth Response Types
interface AuthResponse {
  user: User | null;
  session: Session | null;
}

interface SignUpMetadata {
  name?: string;
  avatar_url?: string;
  [key: string]: unknown;
}

// Auth State Change Callback Type
type AuthStateChangeCallback = (
  event: AuthChangeEvent,
  session: Session | null
) => void;

export const authService = {
  /**
   * Sign up with email and password
   * @param email - User's email address
   * @param password - User's password
   * @param metadata - Optional user metadata (name, avatar_url, etc.)
   * @returns AuthResponse with user and session
   */
  signUp: async (
    email: string,
    password: string,
    metadata?: SignUpMetadata
  ): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  },

  /**
   * Sign in with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns AuthResponse with user and session
   */
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  },

  /**
   * Sign in with OAuth provider
   * @param provider - OAuth provider ('google', 'github', 'kakao')
   * @returns URL data for OAuth redirect
   */
  signInWithOAuth: async (
    provider: OAuthProvider
  ): Promise<{ url: string | null }> => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      url: data.url,
    };
  },

  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Send password reset email
   * @param email - User's email address
   */
  resetPassword: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Update user's password
   * @param newPassword - New password
   */
  updatePassword: async (newPassword: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get the current authenticated user
   * @returns User or null if not authenticated
   */
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  },

  /**
   * Get the current session
   * @returns Session or null if not authenticated
   */
  getSession: async (): Promise<Session | null> => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return session;
  },

  /**
   * Subscribe to auth state changes
   * @param callback - Function to call when auth state changes
   * @returns Subscription object with unsubscribe method
   */
  onAuthStateChange: (callback: AuthStateChangeCallback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );

    return subscription;
  },

  /**
   * Verify OTP (One-Time Password) for email verification or phone auth
   * @param email - User's email address
   * @param token - OTP token
   * @param type - Type of OTP verification
   */
  verifyOtp: async (
    email: string,
    token: string,
    type: 'signup' | 'recovery' | 'email_change' = 'signup'
  ): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session,
    };
  },

  /**
   * Resend email confirmation
   * @param email - User's email address
   */
  resendConfirmation: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Update user metadata
   * @param metadata - User metadata to update
   */
  updateUserMetadata: async (
    metadata: Record<string, unknown>
  ): Promise<User | null> => {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  },

  /**
   * Update user email
   * @param newEmail - New email address
   */
  updateEmail: async (newEmail: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Check if a user session is valid
   * @returns Boolean indicating if session is valid
   */
  isAuthenticated: async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
  },
};
