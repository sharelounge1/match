import { supabase } from '@/lib/supabase';
import type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  NotificationSettings,
  PrivacySettings,
  UserStats,
} from '@/types/database';

// Avatar upload response type
interface AvatarUploadResponse {
  path: string;
  url: string;
}

export const profileService = {
  /**
   * Get profile by user ID
   * @param userId - User's ID
   * @returns Profile data
   */
  getProfile: async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Get current authenticated user's profile
   * @returns Current user's profile
   */
  getMyProfile: async (): Promise<Profile> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(authError.message);
    }

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Create a new profile (typically after signup)
   * @param profile - Profile data to create
   * @returns Created profile
   */
  createProfile: async (profile: ProfileInsert): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Update user profile
   * @param userId - User's ID
   * @param updates - Profile fields to update
   * @returns Updated profile
   */
  updateProfile: async (
    userId: string,
    updates: ProfileUpdate
  ): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Upload user avatar to Supabase Storage
   * @param userId - User's ID
   * @param file - Image file to upload
   * @returns Upload response with path and public URL
   */
  uploadAvatar: async (
    userId: string,
    file: File
  ): Promise<AvatarUploadResponse> => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF).');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(uploadData.path);

    // Update profile with new avatar URL
    await supabase
      .from('profiles')
      .update({
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    return {
      path: uploadData.path,
      url: urlData.publicUrl,
    };
  },

  /**
   * Delete user avatar
   * @param userId - User's ID
   */
  deleteAvatar: async (userId: string): Promise<void> => {
    // Get current profile to find avatar path
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (profile?.avatar_url) {
      // Extract path from URL
      const urlParts = profile.avatar_url.split('/');
      const path = urlParts.slice(-2).join('/');

      // Delete from storage
      await supabase.storage.from('avatars').remove([path]);
    }

    // Update profile
    await supabase
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  },

  /**
   * Update notification settings
   * @param userId - User's ID
   * @param settings - Notification settings to update
   * @returns Updated profile
   */
  updateNotificationSettings: async (
    userId: string,
    settings: Partial<NotificationSettings>
  ): Promise<Profile> => {
    // Get current settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('notification_settings')
      .eq('id', userId)
      .single();

    const currentSettings = profile?.notification_settings || {};

    // Merge with new settings
    const updatedSettings = {
      ...currentSettings,
      ...settings,
    };

    const { data, error } = await supabase
      .from('profiles')
      .update({
        notification_settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Update privacy settings
   * @param userId - User's ID
   * @param settings - Privacy settings to update
   * @returns Updated profile
   */
  updatePrivacySettings: async (
    userId: string,
    settings: Partial<PrivacySettings>
  ): Promise<Profile> => {
    // Get current settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('privacy_settings')
      .eq('id', userId)
      .single();

    const currentSettings = profile?.privacy_settings || {};

    // Merge with new settings
    const updatedSettings = {
      ...currentSettings,
      ...settings,
    };

    const { data, error } = await supabase
      .from('profiles')
      .update({
        privacy_settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  /**
   * Get user statistics
   * @param userId - User's ID
   * @returns User stats including projects, applications, ratings
   */
  getUserStats: async (userId: string): Promise<UserStats> => {
    // Get projects count
    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId);

    const { count: completedProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'completed');

    const { count: activeProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .in('status', ['active', 'in_progress']);

    // Get applications count
    const { count: totalApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('applicant_id', userId);

    const { count: acceptedApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('applicant_id', userId)
      .eq('status', 'accepted');

    // Get profile for rating info
    const { data: profile } = await supabase
      .from('profiles')
      .select('rating, review_count')
      .eq('id', userId)
      .single();

    return {
      total_projects: totalProjects || 0,
      completed_projects: completedProjects || 0,
      active_projects: activeProjects || 0,
      total_applications: totalApplications || 0,
      accepted_applications: acceptedApplications || 0,
      average_rating: profile?.rating || 0,
      total_reviews: profile?.review_count || 0,
    };
  },

  /**
   * Search profiles by skills or roles
   * @param query - Search query
   * @param filters - Optional filters (roles, skills, etc.)
   * @returns Array of matching profiles
   */
  searchProfiles: async (
    query: string,
    filters?: {
      roles?: string[];
      skills?: string[];
      minRating?: number;
    }
  ): Promise<Profile[]> => {
    let queryBuilder = supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${query}%,bio.ilike.%${query}%`);

    if (filters?.roles && filters.roles.length > 0) {
      queryBuilder = queryBuilder.contains('roles', filters.roles);
    }

    if (filters?.skills && filters.skills.length > 0) {
      queryBuilder = queryBuilder.contains('skills', filters.skills);
    }

    if (filters?.minRating) {
      queryBuilder = queryBuilder.gte('rating', filters.minRating);
    }

    const { data, error } = await queryBuilder.order('rating', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  },

  /**
   * Get public profile (respecting privacy settings)
   * @param userId - User's ID to view
   * @returns Public profile data
   */
  getPublicProfile: async (userId: string): Promise<Partial<Profile>> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Apply privacy settings
    const privacySettings = data.privacy_settings as PrivacySettings;

    if (privacySettings?.profile_visibility === 'private') {
      return {
        id: data.id,
        name: data.name,
        avatar_url: data.avatar_url,
      };
    }

    // Filter based on privacy settings
    const publicProfile: Partial<Profile> = {
      id: data.id,
      name: data.name,
      avatar_url: data.avatar_url,
      bio: data.bio,
      roles: data.roles,
      skills: data.skills,
      rating: data.rating,
      review_count: data.review_count,
      projects_completed: data.projects_completed,
    };

    if (privacySettings?.show_email) {
      publicProfile.email = data.email;
    }

    if (privacySettings?.show_location) {
      publicProfile.location = data.location;
    }

    return publicProfile;
  },
};
