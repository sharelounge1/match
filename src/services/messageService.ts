import { supabase, getCurrentUser } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Types
export interface ChatRoom {
  id: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_message_at: string | null;
  participants: ChatParticipant[];
}

export interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string | null;
  profiles?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  attachments: string[] | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export interface SendMessageParams {
  roomId: string;
  content: string;
  attachments?: string[];
}

export interface MessageCallback {
  (message: Message): void;
}

export interface RoomCallback {
  (room: ChatRoom): void;
}

export const messageService = {
  // Get chat rooms for current user
  getChatRooms: async (): Promise<ChatRoom[]> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        participants:chat_participants(
          *,
          profiles(id, name, avatar_url)
        )
      `)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    // Filter rooms where current user is a participant
    const userRooms = (data || []).filter((room) =>
      room.participants.some((p: ChatParticipant) => p.user_id === user.id)
    );

    return userRooms;
  },

  // Get or create chat room with another user
  getOrCreateRoom: async (otherUserId: string, projectId?: string): Promise<ChatRoom> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // First, try to find an existing room between the two users
    const { data: existingRooms, error: searchError } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        participants:chat_participants(
          *,
          profiles(id, name, avatar_url)
        )
      `)
      .eq('project_id', projectId || null);

    if (searchError) throw searchError;

    // Find a room that has both users as participants
    const existingRoom = existingRooms?.find((room) => {
      const participantIds = room.participants.map((p: ChatParticipant) => p.user_id);
      return (
        participantIds.includes(user.id) &&
        participantIds.includes(otherUserId) &&
        participantIds.length === 2
      );
    });

    if (existingRoom) {
      return existingRoom;
    }

    // Create a new room
    const { data: newRoom, error: createError } = await supabase
      .from('chat_rooms')
      .insert({
        project_id: projectId || null,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Add both participants
    const { error: participantError } = await supabase
      .from('chat_participants')
      .insert([
        { room_id: newRoom.id, user_id: user.id },
        { room_id: newRoom.id, user_id: otherUserId },
      ]);

    if (participantError) throw participantError;

    // Fetch the complete room with participants
    const { data: completeRoom, error: fetchError } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        participants:chat_participants(
          *,
          profiles(id, name, avatar_url)
        )
      `)
      .eq('id', newRoom.id)
      .single();

    if (fetchError) throw fetchError;

    return completeRoom;
  },

  // Get messages in a room
  getMessages: async (
    roomId: string,
    limit: number = 50,
    before?: string
  ): Promise<Message[]> => {
    let query = supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id(id, name, avatar_url)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Return in chronological order
    return (data || []).reverse();
  },

  // Send a message
  sendMessage: async (
    roomId: string,
    content: string,
    attachments?: string[]
  ): Promise<Message> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        sender_id: user.id,
        content,
        attachments: attachments || null,
      })
      .select(`
        *,
        profiles:sender_id(id, name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Update room's last message info
    await supabase
      .from('chat_rooms')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    return data;
  },

  // Mark messages as read
  markAsRead: async (roomId: string): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Update messages as read
    const { error: messageError } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('room_id', roomId)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    if (messageError) throw messageError;

    // Update participant's last_read_at
    const { error: participantError } = await supabase
      .from('chat_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', user.id);

    if (participantError) throw participantError;
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', user.id);

    if (error) throw error;
  },

  // Subscribe to new messages (real-time)
  subscribeToMessages: (roomId: string, callback: MessageCallback): RealtimeChannel => {
    return supabase
      .channel(`messages:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch complete message with profile
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              profiles:sender_id(id, name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            callback(data as Message);
          }
        }
      )
      .subscribe();
  },

  // Subscribe to room updates
  subscribeToRooms: (callback: RoomCallback): RealtimeChannel => {
    return supabase
      .channel('chat_rooms_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms',
        },
        async (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            // Fetch complete room with participants
            const { data, error } = await supabase
              .from('chat_rooms')
              .select(`
                *,
                participants:chat_participants(
                  *,
                  profiles(id, name, avatar_url)
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              callback(data as ChatRoom);
            }
          }
        }
      )
      .subscribe();
  },

  // Upload attachment
  uploadAttachment: async (file: File): Promise<string> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get all rooms the user is in
    const { data: participantData, error: participantError } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', user.id);

    if (participantError) throw participantError;

    if (!participantData || participantData.length === 0) {
      return 0;
    }

    const roomIds = participantData.map((p) => p.room_id);

    // Count unread messages
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('room_id', roomIds)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    return count || 0;
  },

  // Unsubscribe from channel
  unsubscribe: (channel: RealtimeChannel): void => {
    supabase.removeChannel(channel);
  },
};
