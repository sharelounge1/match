/**
 * MatchUp Database Type Definitions
 *
 * Comprehensive TypeScript types for Supabase PostgreSQL database.
 * These types provide type safety for all database operations.
 */

// ============================================================================
// Base JSON Type
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================================
// JSONB Field Interfaces
// ============================================================================

export interface ProfileSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  application_updates: boolean;
  project_updates: boolean;
  message_notifications: boolean;
  profile_visibility: 'public' | 'private' | 'connections_only';
  show_email: boolean;
  show_location: boolean;
  show_portfolio: boolean;
  allow_messages: boolean;
  language: string;
  timezone: string;
}

export interface EquityDistribution {
  [role: string]: number;
}

export interface RevenueDistribution {
  [role: string]: number;
}

export interface ContractParty {
  user_id: string;
  name: string;
  email: string;
  role: string;
  signed_at: string | null;
}

export interface ContractTerms {
  description: string;
  start_date: string;
  end_date: string | null;
  termination_conditions: string[];
  confidentiality_clause: boolean;
  non_compete_clause: boolean;
  custom_terms: string[];
}

export interface EquityTerms {
  total_equity: number;
  distribution: Record<string, number>;
  vesting_period_months: number;
  cliff_months: number;
  acceleration_on_exit: boolean;
}

export interface RevenueTerms {
  distribution: Record<string, number>;
  payment_frequency: 'monthly' | 'quarterly' | 'annually';
  minimum_payout: number;
  currency: string;
}

export interface ContractSignature {
  user_id: string;
  signed_at: string;
  ip_address: string;
  signature_hash: string;
}

export interface PaymentMetadata {
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  invoice_id?: string;
  description?: string;
  [key: string]: unknown;
}

export interface NotificationData {
  project_id?: string;
  application_id?: string;
  meeting_id?: string;
  contract_id?: string;
  user_id?: string;
  action_url?: string;
  [key: string]: unknown;
}

// ============================================================================
// Database Type Definition
// ============================================================================

export type Database = {
  public: {
    Tables: {
      // ========================================================================
      // profiles - User profiles
      // ========================================================================
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          bio: string | null;
          roles: string[];
          location: string | null;
          website: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          rating: number;
          review_count: number;
          project_count: number;
          completed_project_count: number;
          is_verified: boolean;
          is_premium: boolean;
          settings: ProfileSettings;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          roles?: string[];
          location?: string | null;
          website?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          rating?: number;
          review_count?: number;
          project_count?: number;
          completed_project_count?: number;
          is_verified?: boolean;
          is_premium?: boolean;
          settings?: ProfileSettings;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          roles?: string[];
          location?: string | null;
          website?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          rating?: number;
          review_count?: number;
          project_count?: number;
          completed_project_count?: number;
          is_verified?: boolean;
          is_premium?: boolean;
          settings?: ProfileSettings;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ========================================================================
      // portfolios - User portfolio items
      // ========================================================================
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          images: string[];
          tech_stack: string[];
          project_url: string | null;
          github_url: string | null;
          start_date: string | null;
          end_date: string | null;
          is_featured: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          images?: string[];
          tech_stack?: string[];
          project_url?: string | null;
          github_url?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_featured?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          images?: string[];
          tech_stack?: string[];
          project_url?: string | null;
          github_url?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          is_featured?: boolean;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'portfolios_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // projects - Project listings
      // ========================================================================
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          short_description: string | null;
          category: string;
          status: Database['public']['Enums']['project_status'];
          roles_needed: string[];
          equity_distribution: EquityDistribution;
          revenue_distribution: RevenueDistribution | null;
          min_equity: number | null;
          max_equity: number | null;
          required_skills: string[];
          preferred_skills: string[];
          location: string | null;
          is_remote: boolean;
          duration_months: number | null;
          expected_start_date: string | null;
          application_deadline: string | null;
          max_team_size: number | null;
          current_team_size: number;
          budget: number | null;
          currency: string;
          thumbnail_url: string | null;
          attachments: string[];
          view_count: number;
          bookmark_count: number;
          application_count: number;
          is_featured: boolean;
          is_urgent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          short_description?: string | null;
          category: string;
          status?: Database['public']['Enums']['project_status'];
          roles_needed: string[];
          equity_distribution: EquityDistribution;
          revenue_distribution?: RevenueDistribution | null;
          min_equity?: number | null;
          max_equity?: number | null;
          required_skills?: string[];
          preferred_skills?: string[];
          location?: string | null;
          is_remote?: boolean;
          duration_months?: number | null;
          expected_start_date?: string | null;
          application_deadline?: string | null;
          max_team_size?: number | null;
          current_team_size?: number;
          budget?: number | null;
          currency?: string;
          thumbnail_url?: string | null;
          attachments?: string[];
          view_count?: number;
          bookmark_count?: number;
          application_count?: number;
          is_featured?: boolean;
          is_urgent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string;
          short_description?: string | null;
          category?: string;
          status?: Database['public']['Enums']['project_status'];
          roles_needed?: string[];
          equity_distribution?: EquityDistribution;
          revenue_distribution?: RevenueDistribution | null;
          min_equity?: number | null;
          max_equity?: number | null;
          required_skills?: string[];
          preferred_skills?: string[];
          location?: string | null;
          is_remote?: boolean;
          duration_months?: number | null;
          expected_start_date?: string | null;
          application_deadline?: string | null;
          max_team_size?: number | null;
          current_team_size?: number;
          budget?: number | null;
          currency?: string;
          thumbnail_url?: string | null;
          attachments?: string[];
          view_count?: number;
          bookmark_count?: number;
          application_count?: number;
          is_featured?: boolean;
          is_urgent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // applications - Job applications
      // ========================================================================
      applications: {
        Row: {
          id: string;
          project_id: string;
          applicant_id: string;
          status: Database['public']['Enums']['application_status'];
          role_applied: string;
          cover_letter: string | null;
          requested_equity: number | null;
          requested_revenue_share: number | null;
          portfolio_items: string[];
          availability_date: string | null;
          expected_hours_per_week: number | null;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          applicant_id: string;
          status?: Database['public']['Enums']['application_status'];
          role_applied: string;
          cover_letter?: string | null;
          requested_equity?: number | null;
          requested_revenue_share?: number | null;
          portfolio_items?: string[];
          availability_date?: string | null;
          expected_hours_per_week?: number | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          applicant_id?: string;
          status?: Database['public']['Enums']['application_status'];
          role_applied?: string;
          cover_letter?: string | null;
          requested_equity?: number | null;
          requested_revenue_share?: number | null;
          portfolio_items?: string[];
          availability_date?: string | null;
          expected_hours_per_week?: number | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'applications_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'applications_applicant_id_fkey';
            columns: ['applicant_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'applications_reviewed_by_fkey';
            columns: ['reviewed_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // meetings - Video/phone meetings
      // ========================================================================
      meetings: {
        Row: {
          id: string;
          host_id: string;
          guest_id: string;
          project_id: string | null;
          application_id: string | null;
          type: Database['public']['Enums']['meeting_type'];
          status: Database['public']['Enums']['meeting_status'];
          title: string | null;
          description: string | null;
          scheduled_at: string;
          duration_minutes: number;
          meeting_url: string | null;
          phone_number: string | null;
          notes: string | null;
          host_joined_at: string | null;
          guest_joined_at: string | null;
          ended_at: string | null;
          recording_url: string | null;
          cancellation_reason: string | null;
          cancelled_by: string | null;
          reminder_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          guest_id: string;
          project_id?: string | null;
          application_id?: string | null;
          type: Database['public']['Enums']['meeting_type'];
          status?: Database['public']['Enums']['meeting_status'];
          title?: string | null;
          description?: string | null;
          scheduled_at: string;
          duration_minutes?: number;
          meeting_url?: string | null;
          phone_number?: string | null;
          notes?: string | null;
          host_joined_at?: string | null;
          guest_joined_at?: string | null;
          ended_at?: string | null;
          recording_url?: string | null;
          cancellation_reason?: string | null;
          cancelled_by?: string | null;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          guest_id?: string;
          project_id?: string | null;
          application_id?: string | null;
          type?: Database['public']['Enums']['meeting_type'];
          status?: Database['public']['Enums']['meeting_status'];
          title?: string | null;
          description?: string | null;
          scheduled_at?: string;
          duration_minutes?: number;
          meeting_url?: string | null;
          phone_number?: string | null;
          notes?: string | null;
          host_joined_at?: string | null;
          guest_joined_at?: string | null;
          ended_at?: string | null;
          recording_url?: string | null;
          cancellation_reason?: string | null;
          cancelled_by?: string | null;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meetings_host_id_fkey';
            columns: ['host_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'meetings_guest_id_fkey';
            columns: ['guest_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'meetings_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'meetings_application_id_fkey';
            columns: ['application_id'];
            referencedRelation: 'applications';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // contracts - Legal contracts
      // ========================================================================
      contracts: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          parties: ContractParty[];
          terms: ContractTerms;
          equity_terms: EquityTerms | null;
          revenue_terms: RevenueTerms | null;
          status: Database['public']['Enums']['contract_status'];
          version: number;
          document_url: string | null;
          signed_document_url: string | null;
          signatures: ContractSignature[];
          all_parties_signed: boolean;
          effective_date: string | null;
          expiration_date: string | null;
          terminated_at: string | null;
          termination_reason: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          parties: ContractParty[];
          terms: ContractTerms;
          equity_terms?: EquityTerms | null;
          revenue_terms?: RevenueTerms | null;
          status?: Database['public']['Enums']['contract_status'];
          version?: number;
          document_url?: string | null;
          signed_document_url?: string | null;
          signatures?: ContractSignature[];
          all_parties_signed?: boolean;
          effective_date?: string | null;
          expiration_date?: string | null;
          terminated_at?: string | null;
          termination_reason?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          parties?: ContractParty[];
          terms?: ContractTerms;
          equity_terms?: EquityTerms | null;
          revenue_terms?: RevenueTerms | null;
          status?: Database['public']['Enums']['contract_status'];
          version?: number;
          document_url?: string | null;
          signed_document_url?: string | null;
          signatures?: ContractSignature[];
          all_parties_signed?: boolean;
          effective_date?: string | null;
          expiration_date?: string | null;
          terminated_at?: string | null;
          termination_reason?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'contracts_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'contracts_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // payments - Payment transactions
      // ========================================================================
      payments: {
        Row: {
          id: string;
          payer_id: string;
          payee_id: string | null;
          contract_id: string | null;
          project_id: string | null;
          amount: number;
          currency: string;
          type: Database['public']['Enums']['payment_type'];
          status: Database['public']['Enums']['payment_status'];
          payment_method: string | null;
          transaction_id: string | null;
          stripe_payment_intent_id: string | null;
          fee_amount: number;
          net_amount: number;
          description: string | null;
          metadata: PaymentMetadata;
          processed_at: string | null;
          failed_at: string | null;
          failure_reason: string | null;
          refunded_at: string | null;
          refund_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          payer_id: string;
          payee_id?: string | null;
          contract_id?: string | null;
          project_id?: string | null;
          amount: number;
          currency?: string;
          type: Database['public']['Enums']['payment_type'];
          status?: Database['public']['Enums']['payment_status'];
          payment_method?: string | null;
          transaction_id?: string | null;
          stripe_payment_intent_id?: string | null;
          fee_amount?: number;
          net_amount?: number;
          description?: string | null;
          metadata?: PaymentMetadata;
          processed_at?: string | null;
          failed_at?: string | null;
          failure_reason?: string | null;
          refunded_at?: string | null;
          refund_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          payer_id?: string;
          payee_id?: string | null;
          contract_id?: string | null;
          project_id?: string | null;
          amount?: number;
          currency?: string;
          type?: Database['public']['Enums']['payment_type'];
          status?: Database['public']['Enums']['payment_status'];
          payment_method?: string | null;
          transaction_id?: string | null;
          stripe_payment_intent_id?: string | null;
          fee_amount?: number;
          net_amount?: number;
          description?: string | null;
          metadata?: PaymentMetadata;
          processed_at?: string | null;
          failed_at?: string | null;
          failure_reason?: string | null;
          refunded_at?: string | null;
          refund_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_payer_id_fkey';
            columns: ['payer_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_payee_id_fkey';
            columns: ['payee_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_contract_id_fkey';
            columns: ['contract_id'];
            referencedRelation: 'contracts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // messages - Chat messages
      // ========================================================================
      messages: {
        Row: {
          id: string;
          chat_room_id: string;
          sender_id: string;
          content: string;
          type: Database['public']['Enums']['message_type'];
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          reply_to_id: string | null;
          is_edited: boolean;
          edited_at: string | null;
          is_deleted: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chat_room_id: string;
          sender_id: string;
          content: string;
          type?: Database['public']['Enums']['message_type'];
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          reply_to_id?: string | null;
          is_edited?: boolean;
          edited_at?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chat_room_id?: string;
          sender_id?: string;
          content?: string;
          type?: Database['public']['Enums']['message_type'];
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          reply_to_id?: string | null;
          is_edited?: boolean;
          edited_at?: string | null;
          is_deleted?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_chat_room_id_fkey';
            columns: ['chat_room_id'];
            referencedRelation: 'chat_rooms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_reply_to_id_fkey';
            columns: ['reply_to_id'];
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // chat_rooms - Chat room info
      // ========================================================================
      chat_rooms: {
        Row: {
          id: string;
          name: string | null;
          type: Database['public']['Enums']['chat_room_type'];
          project_id: string | null;
          created_by: string;
          avatar_url: string | null;
          description: string | null;
          is_archived: boolean;
          last_message_id: string | null;
          last_message_at: string | null;
          message_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          type: Database['public']['Enums']['chat_room_type'];
          project_id?: string | null;
          created_by: string;
          avatar_url?: string | null;
          description?: string | null;
          is_archived?: boolean;
          last_message_id?: string | null;
          last_message_at?: string | null;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          type?: Database['public']['Enums']['chat_room_type'];
          project_id?: string | null;
          created_by?: string;
          avatar_url?: string | null;
          description?: string | null;
          is_archived?: boolean;
          last_message_id?: string | null;
          last_message_at?: string | null;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_rooms_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_rooms_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // chat_participants - Chat room participants
      // ========================================================================
      chat_participants: {
        Row: {
          id: string;
          chat_room_id: string;
          user_id: string;
          role: Database['public']['Enums']['chat_participant_role'];
          nickname: string | null;
          is_muted: boolean;
          is_pinned: boolean;
          unread_count: number;
          last_read_at: string | null;
          last_read_message_id: string | null;
          joined_at: string;
          left_at: string | null;
        };
        Insert: {
          id?: string;
          chat_room_id: string;
          user_id: string;
          role?: Database['public']['Enums']['chat_participant_role'];
          nickname?: string | null;
          is_muted?: boolean;
          is_pinned?: boolean;
          unread_count?: number;
          last_read_at?: string | null;
          last_read_message_id?: string | null;
          joined_at?: string;
          left_at?: string | null;
        };
        Update: {
          id?: string;
          chat_room_id?: string;
          user_id?: string;
          role?: Database['public']['Enums']['chat_participant_role'];
          nickname?: string | null;
          is_muted?: boolean;
          is_pinned?: boolean;
          unread_count?: number;
          last_read_at?: string | null;
          last_read_message_id?: string | null;
          joined_at?: string;
          left_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_participants_chat_room_id_fkey';
            columns: ['chat_room_id'];
            referencedRelation: 'chat_rooms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_participants_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // notifications - User notifications
      // ========================================================================
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: Database['public']['Enums']['notification_type'];
          title: string;
          content: string;
          data: NotificationData;
          is_read: boolean;
          read_at: string | null;
          is_archived: boolean;
          action_url: string | null;
          sender_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database['public']['Enums']['notification_type'];
          title: string;
          content: string;
          data?: NotificationData;
          is_read?: boolean;
          read_at?: string | null;
          is_archived?: boolean;
          action_url?: string | null;
          sender_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database['public']['Enums']['notification_type'];
          title?: string;
          content?: string;
          data?: NotificationData;
          is_read?: boolean;
          read_at?: string | null;
          is_archived?: boolean;
          action_url?: string | null;
          sender_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_sender_id_fkey';
            columns: ['sender_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // bookmarks - Project bookmarks
      // ========================================================================
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookmarks_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookmarks_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // reviews - User reviews/ratings
      // ========================================================================
      reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          reviewee_id: string;
          project_id: string | null;
          contract_id: string | null;
          rating: number;
          comment: string | null;
          is_anonymous: boolean;
          collaboration_rating: number | null;
          communication_rating: number | null;
          skill_rating: number | null;
          reliability_rating: number | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reviewer_id: string;
          reviewee_id: string;
          project_id?: string | null;
          contract_id?: string | null;
          rating: number;
          comment?: string | null;
          is_anonymous?: boolean;
          collaboration_rating?: number | null;
          communication_rating?: number | null;
          skill_rating?: number | null;
          reliability_rating?: number | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          project_id?: string | null;
          contract_id?: string | null;
          rating?: number;
          comment?: string | null;
          is_anonymous?: boolean;
          collaboration_rating?: number | null;
          communication_rating?: number | null;
          skill_rating?: number | null;
          reliability_rating?: number | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_reviewer_id_fkey';
            columns: ['reviewer_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_reviewee_id_fkey';
            columns: ['reviewee_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_contract_id_fkey';
            columns: ['contract_id'];
            referencedRelation: 'contracts';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // skills - Skills list
      // ========================================================================
      skills: {
        Row: {
          id: string;
          name: string;
          name_ko: string | null;
          category: string;
          subcategory: string | null;
          description: string | null;
          icon_url: string | null;
          is_popular: boolean;
          usage_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_ko?: string | null;
          category: string;
          subcategory?: string | null;
          description?: string | null;
          icon_url?: string | null;
          is_popular?: boolean;
          usage_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_ko?: string | null;
          category?: string;
          subcategory?: string | null;
          description?: string | null;
          icon_url?: string | null;
          is_popular?: boolean;
          usage_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      // ========================================================================
      // user_skills - User-skill relationships
      // ========================================================================
      user_skills: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          proficiency: Database['public']['Enums']['skill_proficiency'];
          years_of_experience: number | null;
          is_primary: boolean;
          is_verified: boolean;
          verified_at: string | null;
          endorsement_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_id: string;
          proficiency?: Database['public']['Enums']['skill_proficiency'];
          years_of_experience?: number | null;
          is_primary?: boolean;
          is_verified?: boolean;
          verified_at?: string | null;
          endorsement_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_id?: string;
          proficiency?: Database['public']['Enums']['skill_proficiency'];
          years_of_experience?: number | null;
          is_primary?: boolean;
          is_verified?: boolean;
          verified_at?: string | null;
          endorsement_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_skills_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_skills_skill_id_fkey';
            columns: ['skill_id'];
            referencedRelation: 'skills';
            referencedColumns: ['id'];
          }
        ];
      };

      // ========================================================================
      // reports - User/content reports
      // ========================================================================
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          reported_project_id: string | null;
          reported_message_id: string | null;
          reported_review_id: string | null;
          type: Database['public']['Enums']['report_type'];
          reason: string;
          description: string | null;
          evidence_urls: string[];
          status: Database['public']['Enums']['report_status'];
          priority: Database['public']['Enums']['report_priority'];
          assigned_to: string | null;
          admin_notes: string | null;
          resolution: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          reported_project_id?: string | null;
          reported_message_id?: string | null;
          reported_review_id?: string | null;
          type: Database['public']['Enums']['report_type'];
          reason: string;
          description?: string | null;
          evidence_urls?: string[];
          status?: Database['public']['Enums']['report_status'];
          priority?: Database['public']['Enums']['report_priority'];
          assigned_to?: string | null;
          admin_notes?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_user_id?: string | null;
          reported_project_id?: string | null;
          reported_message_id?: string | null;
          reported_review_id?: string | null;
          type?: Database['public']['Enums']['report_type'];
          reason?: string;
          description?: string | null;
          evidence_urls?: string[];
          status?: Database['public']['Enums']['report_status'];
          priority?: Database['public']['Enums']['report_priority'];
          assigned_to?: string | null;
          admin_notes?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reported_user_id_fkey';
            columns: ['reported_user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reported_project_id_fkey';
            columns: ['reported_project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      get_project_stats: {
        Args: { project_id: string };
        Returns: {
          view_count: number;
          bookmark_count: number;
          application_count: number;
          accepted_count: number;
        };
      };
      get_user_stats: {
        Args: { user_id: string };
        Returns: {
          project_count: number;
          completed_project_count: number;
          total_reviews: number;
          average_rating: number;
        };
      };
      search_projects: {
        Args: {
          search_query: string;
          category_filter?: string;
          role_filter?: string[];
          min_equity?: number;
          max_equity?: number;
        };
        Returns: Database['public']['Tables']['projects']['Row'][];
      };
    };

    Enums: {
      project_status: 'draft' | 'active' | 'paused' | 'completed' | 'closed' | 'archived';
      application_status: 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
      meeting_type: 'video' | 'phone' | 'in_person';
      meeting_status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
      contract_status: 'draft' | 'pending_review' | 'pending_signatures' | 'active' | 'completed' | 'terminated' | 'expired' | 'disputed';
      payment_type: 'subscription' | 'project_fee' | 'commission' | 'payout' | 'refund' | 'escrow' | 'milestone';
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'disputed';
      message_type: 'text' | 'image' | 'file' | 'system' | 'meeting_invite' | 'contract_request';
      chat_room_type: 'direct' | 'group' | 'project' | 'support';
      chat_participant_role: 'owner' | 'admin' | 'member' | 'guest';
      notification_type: 'application_received' | 'application_accepted' | 'application_rejected' | 'meeting_scheduled' | 'meeting_reminder' | 'meeting_cancelled' | 'contract_created' | 'contract_signed' | 'payment_received' | 'payment_sent' | 'message_received' | 'project_update' | 'review_received' | 'system_announcement';
      skill_proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      report_type: 'spam' | 'harassment' | 'fraud' | 'inappropriate_content' | 'impersonation' | 'intellectual_property' | 'other';
      report_status: 'pending' | 'under_review' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';
      report_priority: 'low' | 'medium' | 'high' | 'critical';
      user_role: 'developer' | 'designer' | 'business' | 'marketing' | 'product' | 'other';
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// ============================================================================
// Helper Types - Row Types
// ============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Portfolio = Database['public']['Tables']['portfolios']['Row'];
export type PortfolioInsert = Database['public']['Tables']['portfolios']['Insert'];
export type PortfolioUpdate = Database['public']['Tables']['portfolios']['Update'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type Application = Database['public']['Tables']['applications']['Row'];
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update'];

export type Meeting = Database['public']['Tables']['meetings']['Row'];
export type MeetingInsert = Database['public']['Tables']['meetings']['Insert'];
export type MeetingUpdate = Database['public']['Tables']['meetings']['Update'];

export type Contract = Database['public']['Tables']['contracts']['Row'];
export type ContractInsert = Database['public']['Tables']['contracts']['Insert'];
export type ContractUpdate = Database['public']['Tables']['contracts']['Update'];

export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

export type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'];
export type ChatRoomInsert = Database['public']['Tables']['chat_rooms']['Insert'];
export type ChatRoomUpdate = Database['public']['Tables']['chat_rooms']['Update'];

export type ChatParticipant = Database['public']['Tables']['chat_participants']['Row'];
export type ChatParticipantInsert = Database['public']['Tables']['chat_participants']['Insert'];
export type ChatParticipantUpdate = Database['public']['Tables']['chat_participants']['Update'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];
export type BookmarkInsert = Database['public']['Tables']['bookmarks']['Insert'];
export type BookmarkUpdate = Database['public']['Tables']['bookmarks']['Update'];

export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];

export type Skill = Database['public']['Tables']['skills']['Row'];
export type SkillInsert = Database['public']['Tables']['skills']['Insert'];
export type SkillUpdate = Database['public']['Tables']['skills']['Update'];

export type UserSkill = Database['public']['Tables']['user_skills']['Row'];
export type UserSkillInsert = Database['public']['Tables']['user_skills']['Insert'];
export type UserSkillUpdate = Database['public']['Tables']['user_skills']['Update'];

export type Report = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];

// ============================================================================
// Helper Types - Enums
// ============================================================================

export type ProjectStatus = Database['public']['Enums']['project_status'];
export type ApplicationStatus = Database['public']['Enums']['application_status'];
export type MeetingType = Database['public']['Enums']['meeting_type'];
export type MeetingStatus = Database['public']['Enums']['meeting_status'];
export type ContractStatus = Database['public']['Enums']['contract_status'];
export type PaymentType = Database['public']['Enums']['payment_type'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type MessageType = Database['public']['Enums']['message_type'];
export type ChatRoomType = Database['public']['Enums']['chat_room_type'];
export type ChatParticipantRole = Database['public']['Enums']['chat_participant_role'];
export type NotificationType = Database['public']['Enums']['notification_type'];
export type SkillProficiency = Database['public']['Enums']['skill_proficiency'];
export type ReportType = Database['public']['Enums']['report_type'];
export type ReportStatus = Database['public']['Enums']['report_status'];
export type ReportPriority = Database['public']['Enums']['report_priority'];
export type UserRole = Database['public']['Enums']['user_role'];

// ============================================================================
// Extended Types with Relations
// ============================================================================

export interface ProjectWithOwner extends Project {
  profiles: Profile;
}

export interface ProjectWithApplications extends Project {
  profiles: Profile;
  applications: Application[];
}

export interface ApplicationWithDetails extends Application {
  projects: Project;
  profiles: Profile;
}

export interface MeetingWithParticipants extends Meeting {
  host: Profile;
  guest: Profile;
  projects?: Project;
}

export interface ChatRoomWithParticipants extends ChatRoom {
  chat_participants: (ChatParticipant & {
    profiles: Profile;
  })[];
}

export interface MessageWithSender extends Message {
  profiles: Profile;
}

export interface NotificationWithSender extends Notification {
  sender: Profile | null;
}

export interface ReviewWithUsers extends Review {
  reviewer: Profile;
  reviewee: Profile;
  projects?: Project;
}

export interface UserSkillWithDetails extends UserSkill {
  skills: Skill;
}

export interface BookmarkWithProject extends Bookmark {
  projects: ProjectWithOwner;
}

// ============================================================================
// Query Filter Types
// ============================================================================

export interface ProjectFilters {
  category?: string;
  roles?: string[];
  minEquity?: number;
  maxEquity?: number;
  isRemote?: boolean;
  status?: ProjectStatus;
  search?: string;
  sortBy?: 'created_at' | 'view_count' | 'bookmark_count' | 'application_count';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  page?: number;
}

export interface ApplicationFilters {
  projectId?: string;
  applicantId?: string;
  status?: ApplicationStatus;
  role?: string;
  limit?: number;
  offset?: number;
  page?: number;
}

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Auth User Type (from Supabase Auth)
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
  created_at: string;
}

// ============================================================================
// User Stats Type
// ============================================================================

export interface UserStats {
  total_projects: number;
  completed_projects: number;
  active_projects: number;
  total_applications: number;
  accepted_applications: number;
  average_rating: number;
  total_reviews: number;
}
