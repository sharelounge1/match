import { supabase, getCurrentUser } from '@/lib/supabase';
import type {
  Project,
  ProjectInsert,
  ProjectUpdate,
  ProjectWithOwner,
  ProjectFilters
} from '@/types/database';

export const projectService = {
  /**
   * Get projects with filters and pagination
   */
  getProjects: async (filters?: ProjectFilters) => {
    const {
      status = 'active',
      category,
      roles,
      search,
      page = 1,
      limit = 12,
    } = filters || {};

    let query = supabase
      .from('projects')
      .select(`
        *,
        profiles!owner_id (
          id,
          name,
          avatar_url,
          rating,
          review_count
        )
      `, { count: 'exact' })
      .eq('status', status);

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply roles filter (contains any of the specified roles)
    if (roles && roles.length > 0) {
      query = query.overlaps('roles_needed', roles);
    }

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return {
      projects: data as ProjectWithOwner[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  /**
   * Get single project with owner profile and applications count
   */
  getProject: async (projectId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!owner_id (
          id,
          name,
          email,
          avatar_url,
          bio,
          roles,
          skills,
          experience_years,
          portfolio_url,
          github_url,
          linkedin_url,
          rating,
          review_count,
          completed_projects
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data as ProjectWithOwner;
  },

  /**
   * Get projects posted by the current user
   */
  getMyProjects: async (status?: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from('projects')
      .select(`
        *,
        profiles!owner_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('owner_id', user.id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch my projects: ${error.message}`);
    }

    return data as ProjectWithOwner[];
  },

  /**
   * Create a new project
   */
  createProject: async (project: Partial<ProjectInsert>) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const projectData: Partial<ProjectInsert> = {
      ...project,
      owner_id: user.id,
      status: 'draft',
      current_team_size: 1,
      view_count: 0,
      application_count: 0,
      bookmark_count: 0,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select(`
        *,
        profiles!owner_id (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data as ProjectWithOwner;
  },

  /**
   * Update an existing project
   */
  updateProject: async (projectId: string, updates: ProjectUpdate) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .select(`
        *,
        profiles!owner_id (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return data as ProjectWithOwner;
  },

  /**
   * Delete a project (soft delete by changing status)
   */
  deleteProject: async (projectId: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('owner_id', user.id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }

    return true;
  },

  /**
   * Publish a project (change status from draft to active)
   */
  publishProject: async (projectId: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        status: 'active',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .eq('status', 'draft')
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to publish project: ${error.message}`);
    }

    return data as Project;
  },

  /**
   * Close a project
   */
  closeProject: async (projectId: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to close project: ${error.message}`);
    }

    return data as Project;
  },

  /**
   * Increment view count for a project
   */
  incrementViewCount: async (projectId: string) => {
    const { error } = await supabase.rpc('increment_view_count', {
      project_id: projectId,
    });

    // Fallback if RPC doesn't exist - use direct update
    if (error) {
      const { data: project } = await supabase
        .from('projects')
        .select('view_count')
        .eq('id', projectId)
        .single();

      if (project) {
        await supabase
          .from('projects')
          .update({ view_count: (project.view_count || 0) + 1 })
          .eq('id', projectId);
      }
    }

    return true;
  },

  /**
   * Get featured projects
   */
  getFeaturedProjects: async (limit: number = 6) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!owner_id (
          id,
          name,
          avatar_url,
          rating
        )
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch featured projects: ${error.message}`);
    }

    return data as ProjectWithOwner[];
  },

  /**
   * Get recent projects
   */
  getRecentProjects: async (limit: number = 8) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!owner_id (
          id,
          name,
          avatar_url,
          rating
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent projects: ${error.message}`);
    }

    return data as ProjectWithOwner[];
  },

  /**
   * Upload project screenshots to Supabase Storage
   */
  uploadScreenshots: async (projectId: string, files: File[]) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('project-screenshots')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`Failed to upload screenshot: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('project-screenshots')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    });

    const urls = await Promise.all(uploadPromises);

    // Update project with new screenshot URLs
    const { data: project } = await supabase
      .from('projects')
      .select('screenshots')
      .eq('id', projectId)
      .single();

    const existingScreenshots = project?.screenshots || [];
    const updatedScreenshots = [...existingScreenshots, ...urls];

    const { data, error } = await supabase
      .from('projects')
      .update({ screenshots: updatedScreenshots })
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project screenshots: ${error.message}`);
    }

    return data as Project;
  },

  /**
   * Get projects by owner ID
   */
  getProjectsByOwner: async (ownerId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles!owner_id (
          id,
          name,
          avatar_url,
          rating
        )
      `)
      .eq('owner_id', ownerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch owner projects: ${error.message}`);
    }

    return data as ProjectWithOwner[];
  },

  /**
   * Search projects by keyword
   */
  searchProjects: async (keyword: string, limit: number = 10) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        category,
        profiles!owner_id (
          name,
          avatar_url
        )
      `)
      .eq('status', 'active')
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search projects: ${error.message}`);
    }

    return data;
  },
};
