import { supabase, getCurrentUser } from '@/lib/supabase';
import type { Bookmark, BookmarkWithProject } from '@/types/database';

export const bookmarkService = {
  /**
   * Get user's bookmarked projects
   */
  getBookmarks: async (userId?: string) => {
    const user = await getCurrentUser();
    const targetUserId = userId || user?.id;

    if (!targetUserId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        projects!project_id (
          id,
          title,
          description,
          category,
          status,
          roles_needed,
          skills_required,
          equity_distribution,
          team_size,
          current_team_size,
          view_count,
          application_count,
          bookmark_count,
          created_at,
          profiles!owner_id (
            id,
            name,
            avatar_url,
            rating
          )
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch bookmarks: ${error.message}`);
    }

    return data as BookmarkWithProject[];
  },

  /**
   * Add a bookmark
   */
  addBookmark: async (projectId: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if already bookmarked
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    if (existing) {
      throw new Error('Project already bookmarked');
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        project_id: projectId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add bookmark: ${error.message}`);
    }

    // Increment bookmark count on project
    await supabase.rpc('increment_bookmark_count', {
      project_id: projectId,
    }).catch(async () => {
      // Fallback if RPC doesn't exist
      const { data: project } = await supabase
        .from('projects')
        .select('bookmark_count')
        .eq('id', projectId)
        .single();

      if (project) {
        await supabase
          .from('projects')
          .update({ bookmark_count: (project.bookmark_count || 0) + 1 })
          .eq('id', projectId);
      }
    });

    return data as Bookmark;
  },

  /**
   * Remove a bookmark
   */
  removeBookmark: async (projectId: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('project_id', projectId);

    if (error) {
      throw new Error(`Failed to remove bookmark: ${error.message}`);
    }

    // Decrement bookmark count on project
    await supabase.rpc('decrement_bookmark_count', {
      project_id: projectId,
    }).catch(async () => {
      // Fallback if RPC doesn't exist
      const { data: project } = await supabase
        .from('projects')
        .select('bookmark_count')
        .eq('id', projectId)
        .single();

      if (project && project.bookmark_count > 0) {
        await supabase
          .from('projects')
          .update({ bookmark_count: project.bookmark_count - 1 })
          .eq('id', projectId);
      }
    });

    return true;
  },

  /**
   * Check if a project is bookmarked by current user
   */
  isBookmarked: async (projectId: string) => {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }

    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single();

    return !!data;
  },

  /**
   * Toggle bookmark status
   */
  toggleBookmark: async (projectId: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const isCurrentlyBookmarked = await bookmarkService.isBookmarked(projectId);

    if (isCurrentlyBookmarked) {
      await bookmarkService.removeBookmark(projectId);
      return { bookmarked: false };
    } else {
      await bookmarkService.addBookmark(projectId);
      return { bookmarked: true };
    }
  },

  /**
   * Get bookmark count for current user
   */
  getBookmarkCount: async () => {
    const user = await getCurrentUser();
    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to get bookmark count: ${error.message}`);
    }

    return count || 0;
  },

  /**
   * Get multiple bookmark statuses at once (for lists)
   */
  getBookmarkStatuses: async (projectIds: string[]) => {
    const user = await getCurrentUser();
    if (!user) {
      return {};
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .select('project_id')
      .eq('user_id', user.id)
      .in('project_id', projectIds);

    if (error) {
      throw new Error(`Failed to get bookmark statuses: ${error.message}`);
    }

    const bookmarkedIds = new Set(data.map(b => b.project_id));
    const statuses: Record<string, boolean> = {};

    projectIds.forEach(id => {
      statuses[id] = bookmarkedIds.has(id);
    });

    return statuses;
  },

  /**
   * Get bookmarks with pagination
   */
  getBookmarksPaginated: async (page: number = 1, limit: number = 12) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('bookmarks')
      .select(`
        *,
        projects!project_id (
          id,
          title,
          description,
          category,
          status,
          roles_needed,
          equity_distribution,
          team_size,
          view_count,
          application_count,
          bookmark_count,
          created_at,
          profiles!owner_id (
            id,
            name,
            avatar_url,
            rating
          )
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch bookmarks: ${error.message}`);
    }

    return {
      bookmarks: data as BookmarkWithProject[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  /**
   * Clear all bookmarks for current user
   */
  clearAllBookmarks: async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to clear bookmarks: ${error.message}`);
    }

    return true;
  },
};
