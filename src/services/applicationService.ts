import { supabase, getCurrentUser } from '@/lib/supabase';
import type {
  Application,
  ApplicationInsert,
  ApplicationWithDetails,
  ApplicationFilters
} from '@/types/database';

export const applicationService = {
  /**
   * Get applications for a specific project (for project owner)
   */
  getProjectApplications: async (projectId: string, status?: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from('applications')
      .select(`
        *,
        profiles!applicant_id (
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
        ),
        projects!project_id (
          id,
          title,
          owner_id
        )
      `)
      .eq('project_id', projectId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch project applications: ${error.message}`);
    }

    // Verify user is project owner
    if (data.length > 0 && data[0].projects?.owner_id !== user.id) {
      throw new Error('Not authorized to view these applications');
    }

    return data as ApplicationWithDetails[];
  },

  /**
   * Get applications submitted by the current user (as applicant)
   */
  getMyApplications: async (status?: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from('applications')
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
          owner_id,
          profiles!owner_id (
            id,
            name,
            avatar_url,
            rating
          )
        )
      `)
      .eq('applicant_id', user.id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch my applications: ${error.message}`);
    }

    return data;
  },

  /**
   * Get a single application with full details
   */
  getApplication: async (applicationId: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        profiles!applicant_id (
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
        ),
        projects!project_id (
          id,
          title,
          description,
          category,
          status,
          roles_needed,
          equity_distribution,
          owner_id,
          profiles!owner_id (
            id,
            name,
            avatar_url
          )
        )
      `)
      .eq('id', applicationId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch application: ${error.message}`);
    }

    // Verify user is either applicant or project owner
    const isApplicant = data.applicant_id === user.id;
    const isOwner = data.projects?.owner_id === user.id;

    if (!isApplicant && !isOwner) {
      throw new Error('Not authorized to view this application');
    }

    return data as ApplicationWithDetails;
  },

  /**
   * Create a new application (apply to project)
   */
  createApplication: async (application: {
    project_id: string;
    applied_roles: string[];
    cover_letter?: string;
    portfolio_ids?: string[];
    requested_equity?: number;
    requested_revenue_share?: number;
  }) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user already applied to this project
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('project_id', application.project_id)
      .eq('applicant_id', user.id)
      .not('status', 'eq', 'withdrawn')
      .single();

    if (existingApplication) {
      throw new Error('You have already applied to this project');
    }

    // Check if user is the project owner
    const { data: project } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', application.project_id)
      .single();

    if (project?.owner_id === user.id) {
      throw new Error('You cannot apply to your own project');
    }

    const applicationData: Partial<ApplicationInsert> = {
      ...application,
      applicant_id: user.id,
      portfolio_ids: application.portfolio_ids || [],
    };

    const { data, error } = await supabase
      .from('applications')
      .insert(applicationData)
      .select(`
        *,
        projects!project_id (
          id,
          title,
          owner_id
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create application: ${error.message}`);
    }

    // Increment application count on project
    await supabase.rpc('increment_application_count', {
      project_id: application.project_id,
    }).catch(() => {
      // Fallback if RPC doesn't exist
      supabase
        .from('projects')
        .update({
          application_count: project ?
            (project as unknown as { application_count: number }).application_count + 1 : 1
        })
        .eq('id', application.project_id);
    });

    return data as Application;
  },

  /**
   * Update application status (for project owner)
   */
  updateApplicationStatus: async (
    applicationId: string,
    status: Application['status'],
    note?: string
  ) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get application to verify ownership
    const { data: application } = await supabase
      .from('applications')
      .select(`
        *,
        projects!project_id (owner_id)
      `)
      .eq('id', applicationId)
      .single();

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.projects?.owner_id !== user.id) {
      throw new Error('Not authorized to update this application');
    }

    const updateData: Partial<Application> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (note) {
      if (status === 'rejected') {
        updateData.rejection_reason = note;
      } else {
        updateData.owner_note = note;
      }
    }

    const { data, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }

    return data as Application;
  },

  /**
   * Withdraw an application (for applicant)
   */
  withdrawApplication: async (applicationId: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('applications')
      .update({
        status: 'withdrawn',
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .eq('applicant_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to withdraw application: ${error.message}`);
    }

    return data as Application;
  },

  /**
   * Accept an application
   */
  acceptApplication: async (applicationId: string) => {
    return applicationService.updateApplicationStatus(applicationId, 'accepted');
  },

  /**
   * Reject an application
   */
  rejectApplication: async (applicationId: string, reason?: string) => {
    return applicationService.updateApplicationStatus(applicationId, 'rejected', reason);
  },

  /**
   * Shortlist an application
   */
  shortlistApplication: async (applicationId: string) => {
    return applicationService.updateApplicationStatus(applicationId, 'shortlisted');
  },

  /**
   * Get application statistics for a project
   */
  getProjectApplicationStats: async (projectId: string) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('applications')
      .select('status')
      .eq('project_id', projectId);

    if (error) {
      throw new Error(`Failed to fetch application stats: ${error.message}`);
    }

    const stats = {
      total: data.length,
      pending: data.filter(a => a.status === 'pending').length,
      shortlisted: data.filter(a => a.status === 'shortlisted').length,
      accepted: data.filter(a => a.status === 'accepted').length,
      rejected: data.filter(a => a.status === 'rejected').length,
      withdrawn: data.filter(a => a.status === 'withdrawn').length,
    };

    return stats;
  },

  /**
   * Check if user has applied to a project
   */
  hasApplied: async (projectId: string) => {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }

    const { data } = await supabase
      .from('applications')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('applicant_id', user.id)
      .not('status', 'eq', 'withdrawn')
      .single();

    return data ? { applied: true, status: data.status } : { applied: false };
  },

  /**
   * Get applications with pagination
   */
  getApplicationsPaginated: async (
    filters: ApplicationFilters & { projectId?: string }
  ) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { status, page = 1, limit = 10, projectId } = filters;

    let query = supabase
      .from('applications')
      .select(`
        *,
        profiles!applicant_id (
          id,
          name,
          avatar_url,
          rating
        ),
        projects!project_id (
          id,
          title,
          owner_id
        )
      `, { count: 'exact' });

    if (projectId) {
      query = query.eq('project_id', projectId);
    } else {
      query = query.eq('applicant_id', user.id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    return {
      applications: data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },
};
