import { supabase, getCurrentUser } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'message_received'
  | 'meeting_scheduled'
  | 'meeting_reminder'
  | 'contract_created'
  | 'contract_signed'
  | 'payment_received'
  | 'review_received'
  | 'project_update'
  | 'system';

export interface NotificationFilters {
  type?: NotificationType;
  is_read?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateNotificationParams {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
}

export interface NotificationCallback {
  (notification: Notification): void;
}

export const notificationService = {
  // Get notifications for current user
  getNotifications: async (filters?: NotificationFilters): Promise<Notification[]> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    return count || 0;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
  },

  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Delete all read notifications
  deleteAllRead: async (): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .eq('is_read', true);

    if (error) throw error;
  },

  // Subscribe to new notifications (real-time)
  subscribeToNotifications: (callback: NotificationCallback): RealtimeChannel => {
    // Get current user synchronously from session
    const subscription = supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return null;

      return supabase
        .channel(`notifications:${session.user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            callback(payload.new as Notification);
          }
        )
        .subscribe();
    });

    // Return a placeholder channel that will be replaced
    // This is a workaround for the async nature of getting the user
    const channel = supabase.channel('notifications_placeholder');

    // Handle the actual subscription
    subscription.then((actualChannel) => {
      if (actualChannel) {
        Object.assign(channel, actualChannel);
      }
    });

    return channel;
  },

  // Create notification (typically called from Edge Functions or other services)
  createNotification: async (notification: CreateNotificationParams): Promise<Notification> => {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link || null,
        data: notification.data || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // Create multiple notifications (batch)
  createNotifications: async (notifications: CreateNotificationParams[]): Promise<Notification[]> => {
    const notificationsToInsert = notifications.map((notification) => ({
      user_id: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link || null,
      data: notification.data || null,
      is_read: false,
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationsToInsert)
      .select();

    if (error) throw error;

    return data || [];
  },

  // Get notifications grouped by date
  getNotificationsGroupedByDate: async (
    limit: number = 50
  ): Promise<Record<string, Notification[]>> => {
    const notifications = await notificationService.getNotifications({ limit });

    const grouped: Record<string, Notification[]> = {};

    notifications.forEach((notification) => {
      const date = new Date(notification.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(notification);
    });

    return grouped;
  },

  // Unsubscribe from channel
  unsubscribe: (channel: RealtimeChannel): void => {
    supabase.removeChannel(channel);
  },
};
