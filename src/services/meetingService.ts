import { supabase } from '@/lib/supabase';

// Types
export interface Meeting {
  id: string;
  project_id: string;
  application_id: string;
  organizer_id: string;
  attendee_id: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_type: 'online' | 'offline' | 'phone';
  agenda: string | null;
  meeting_link: string | null;
  location: string | null;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  summary: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingInsert {
  project_id: string;
  application_id: string;
  attendee_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  meeting_type?: 'online' | 'offline' | 'phone';
  agenda?: string;
  meeting_link?: string;
  location?: string;
}

export interface MeetingUpdate {
  scheduled_at?: string;
  duration_minutes?: number;
  meeting_type?: 'online' | 'offline' | 'phone';
  agenda?: string;
  meeting_link?: string;
  location?: string;
  status?: Meeting['status'];
  summary?: string;
  cancellation_reason?: string;
}

export interface MeetingWithDetails extends Meeting {
  project: {
    id: string;
    title: string;
  };
  organizer: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  attendee: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export const meetingService = {
  // Get user's meetings
  getMeetings: async (status?: string): Promise<MeetingWithDetails[]> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('meetings')
      .select(`
        *,
        project:projects!project_id(id, title),
        organizer:profiles!organizer_id(id, name, avatar_url),
        attendee:profiles!attendee_id(id, name, avatar_url)
      `)
      .or(`organizer_id.eq.${user.id},attendee_id.eq.${user.id}`);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data as MeetingWithDetails[];
  },

  // Get single meeting
  getMeeting: async (meetingId: string): Promise<MeetingWithDetails> => {
    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        project:projects!project_id(id, title),
        organizer:profiles!organizer_id(id, name, avatar_url),
        attendee:profiles!attendee_id(id, name, avatar_url)
      `)
      .eq('id', meetingId)
      .single();

    if (error) throw error;
    return data as MeetingWithDetails;
  },

  // Schedule meeting
  scheduleMeeting: async (meeting: MeetingInsert): Promise<Meeting> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        ...meeting,
        organizer_id: user.id,
        duration_minutes: meeting.duration_minutes || 30,
        meeting_type: meeting.meeting_type || 'online',
        status: 'scheduled',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Meeting;
  },

  // Update meeting
  updateMeeting: async (meetingId: string, updates: MeetingUpdate): Promise<Meeting> => {
    const { data, error } = await supabase
      .from('meetings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId)
      .select()
      .single();

    if (error) throw error;
    return data as Meeting;
  },

  // Cancel meeting
  cancelMeeting: async (meetingId: string, reason?: string): Promise<Meeting> => {
    const { data, error } = await supabase
      .from('meetings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId)
      .select()
      .single();

    if (error) throw error;
    return data as Meeting;
  },

  // Complete meeting
  completeMeeting: async (meetingId: string, summary?: string): Promise<Meeting> => {
    const { data, error } = await supabase
      .from('meetings')
      .update({
        status: 'completed',
        summary: summary || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId)
      .select()
      .single();

    if (error) throw error;
    return data as Meeting;
  },

  // Confirm meeting (attendee)
  confirmMeeting: async (meetingId: string): Promise<Meeting> => {
    const { data, error } = await supabase
      .from('meetings')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId)
      .select()
      .single();

    if (error) throw error;
    return data as Meeting;
  },

  // Get upcoming meetings
  getUpcomingMeetings: async (limit: number = 5): Promise<MeetingWithDetails[]> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        project:projects!project_id(id, title),
        organizer:profiles!organizer_id(id, name, avatar_url),
        attendee:profiles!attendee_id(id, name, avatar_url)
      `)
      .or(`organizer_id.eq.${user.id},attendee_id.eq.${user.id}`)
      .in('status', ['scheduled', 'confirmed'])
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as MeetingWithDetails[];
  },
};
