-- ============================================================================
-- MatchUp Database Schema - Initial Migration
-- Version: 1.0
-- Description: Complete database schema for MatchUp collaboration platform
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS AND UTILITY FUNCTIONS
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- ============================================================================
-- SECTION 2: UTILITY FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function to handle new user creation (creates profile automatically)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at)
    VALUES (NEW.id, NEW.email, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 3: CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 profiles - User profiles (extends auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,

    -- Role information (multiple selection allowed)
    roles TEXT[] NOT NULL DEFAULT '{}',  -- ['dev', 'biz', 'marketing', 'design']
    primary_role VARCHAR(20),  -- Primary role

    -- Profile details
    bio TEXT,
    company VARCHAR(100),
    position VARCHAR(100),
    experience_years INTEGER DEFAULT 0,

    -- Verification information
    is_verified BOOLEAN DEFAULT FALSE,
    github_username VARCHAR(100),
    github_verified BOOLEAN DEFAULT FALSE,
    linkedin_url TEXT,
    portfolio_url TEXT,

    -- Statistics
    projects_completed INTEGER DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,

    -- Settings
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    privacy_settings JSONB DEFAULT '{"show_email": false, "show_phone": false}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX idx_profiles_roles ON profiles USING GIN (roles);
CREATE INDEX idx_profiles_primary_role ON profiles (primary_role);
CREATE INDEX idx_profiles_rating ON profiles (rating DESC);
CREATE INDEX idx_profiles_created_at ON profiles (created_at DESC);
CREATE INDEX idx_profiles_email ON profiles (email);
CREATE INDEX idx_profiles_name ON profiles (name);

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 3.2 skills - Skills/technologies list
-- ----------------------------------------------------------------------------
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),  -- 'language', 'framework', 'tool', 'soft_skill'
    icon_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for skills
CREATE INDEX idx_skills_category ON skills (category);
CREATE INDEX idx_skills_name ON skills (name);

-- Enable RLS for skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skills (read-only for users)
CREATE POLICY "skills_select_policy" ON skills
    FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- 3.3 user_skills - User-skill relationships
-- ----------------------------------------------------------------------------
CREATE TABLE user_skills (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER DEFAULT 3 CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    years_experience INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (user_id, skill_id)
);

-- Indexes for user_skills
CREATE INDEX idx_user_skills_user_id ON user_skills (user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills (skill_id);
CREATE INDEX idx_user_skills_proficiency ON user_skills (proficiency_level DESC);

-- Trigger for user_skills updated_at
CREATE TRIGGER update_user_skills_updated_at
    BEFORE UPDATE ON user_skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for user_skills
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_skills
CREATE POLICY "user_skills_select_policy" ON user_skills
    FOR SELECT USING (true);

CREATE POLICY "user_skills_insert_policy" ON user_skills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_skills_update_policy" ON user_skills
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_skills_delete_policy" ON user_skills
    FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3.4 portfolios - User portfolio items
-- ----------------------------------------------------------------------------
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),  -- 'project', 'certification', 'experience'

    -- Links and media
    url TEXT,
    image_urls TEXT[],
    video_url TEXT,

    -- Metadata
    tech_stack TEXT[],
    start_date DATE,
    end_date DATE,
    is_ongoing BOOLEAN DEFAULT FALSE,

    -- Display settings
    is_public BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for portfolios
CREATE INDEX idx_portfolios_user_id ON portfolios (user_id);
CREATE INDEX idx_portfolios_category ON portfolios (category);
CREATE INDEX idx_portfolios_is_public ON portfolios (is_public);
CREATE INDEX idx_portfolios_display_order ON portfolios (user_id, display_order);

-- Trigger for portfolios updated_at
CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for portfolios
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolios
CREATE POLICY "portfolios_select_policy" ON portfolios
    FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "portfolios_insert_policy" ON portfolios
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "portfolios_update_policy" ON portfolios
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "portfolios_delete_policy" ON portfolios
    FOR DELETE USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 3.5 projects - Project listings
-- ----------------------------------------------------------------------------
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Basic information
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),

    -- Project classification
    project_type VARCHAR(20) NOT NULL,  -- 'idea', 'service'
    category VARCHAR(50),  -- 'app', 'web', 'ai', 'fintech', 'ecommerce', 'other'
    stage VARCHAR(20) DEFAULT 'idea',  -- 'idea', 'mvp', 'beta', 'launched'

    -- Detailed description
    problem_statement TEXT,  -- Problem definition
    solution TEXT,           -- Solution
    target_customer TEXT,    -- Target customer
    market_size TEXT,        -- Market size
    competitive_advantage TEXT,  -- Competitive advantage

    -- Roles needed (multiple selection)
    roles_needed TEXT[] NOT NULL DEFAULT '{}',  -- ['dev', 'biz', 'marketing', 'design']

    -- Equity/Revenue conditions
    equity_distribution JSONB,  -- {"dev": 40, "biz": 40, "marketing": 10, "design": 10}
    revenue_distribution JSONB, -- {"dev": 30, "biz": 30, "marketing": 20, "design": 20}

    -- Additional conditions
    work_type VARCHAR(20) DEFAULT 'remote',  -- 'remote', 'onsite', 'hybrid'
    work_hours VARCHAR(50),      -- "10 hours/week", "Full-time" etc.
    expected_duration VARCHAR(50), -- "3 months", "6 months", "Long-term"

    -- Service-based project fields
    demo_url TEXT,
    github_url TEXT,
    screenshots TEXT[],
    video_url TEXT,

    -- Status management
    status VARCHAR(20) DEFAULT 'draft',  -- 'draft', 'active', 'paused', 'completed', 'closed'
    is_featured BOOLEAN DEFAULT FALSE,

    -- Recruitment information
    deadline TIMESTAMPTZ,
    max_applicants INTEGER DEFAULT 100,
    current_applicants INTEGER DEFAULT 0,

    -- Statistics
    view_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,

    -- Payment information
    upload_fee_paid BOOLEAN DEFAULT FALSE,
    payment_id UUID,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- Indexes for projects
CREATE INDEX idx_projects_owner_id ON projects (owner_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_project_type ON projects (project_type);
CREATE INDEX idx_projects_category ON projects (category);
CREATE INDEX idx_projects_roles_needed ON projects USING GIN (roles_needed);
CREATE INDEX idx_projects_created_at ON projects (created_at DESC);
CREATE INDEX idx_projects_deadline ON projects (deadline);
CREATE INDEX idx_projects_featured ON projects (is_featured) WHERE is_featured = true;
CREATE INDEX idx_projects_stage ON projects (stage);
CREATE INDEX idx_projects_work_type ON projects (work_type);

-- Trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "projects_select_policy" ON projects
    FOR SELECT USING (status = 'active' OR owner_id = auth.uid());

CREATE POLICY "projects_insert_policy" ON projects
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_update_policy" ON projects
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "projects_delete_policy" ON projects
    FOR DELETE USING (owner_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 3.6 applications - Project applications
-- ----------------------------------------------------------------------------
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Applied roles (max 2)
    applied_roles TEXT[] NOT NULL,  -- ['dev', 'marketing']

    -- Application content
    cover_letter TEXT,
    appeal_points TEXT,
    expected_contribution TEXT,

    -- Condition negotiation
    requested_equity DECIMAL(5, 2),
    requested_revenue_share DECIMAL(5, 2),

    -- Attachments
    portfolio_ids UUID[],  -- Selected portfolios
    additional_files TEXT[],

    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'

    -- Result notes
    owner_note TEXT,  -- Internal note by project owner
    rejection_reason TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    decided_at TIMESTAMPTZ,

    -- Unique constraint
    UNIQUE(project_id, applicant_id)
);

-- Indexes for applications
CREATE INDEX idx_applications_project_id ON applications (project_id);
CREATE INDEX idx_applications_applicant_id ON applications (applicant_id);
CREATE INDEX idx_applications_status ON applications (status);
CREATE INDEX idx_applications_created_at ON applications (created_at DESC);

-- Trigger for applications updated_at
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
CREATE POLICY "applications_select_applicant_policy" ON applications
    FOR SELECT USING (applicant_id = auth.uid());

CREATE POLICY "applications_select_owner_policy" ON applications
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "applications_insert_policy" ON applications
    FOR INSERT WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "applications_update_applicant_policy" ON applications
    FOR UPDATE USING (applicant_id = auth.uid());

CREATE POLICY "applications_update_owner_policy" ON applications
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "applications_delete_policy" ON applications
    FOR DELETE USING (applicant_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 3.7 meetings - Video/phone meetings
-- ----------------------------------------------------------------------------
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    -- Participants
    scheduler_id UUID NOT NULL REFERENCES profiles(id),  -- Meeting organizer
    attendee_id UUID NOT NULL REFERENCES profiles(id),   -- Meeting attendee

    -- Schedule
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',

    -- Meeting method
    meeting_type VARCHAR(20) DEFAULT 'video',  -- 'video', 'phone', 'chat', 'offline'
    meeting_url TEXT,  -- Video meeting URL
    location TEXT,     -- Offline location

    -- Status
    status VARCHAR(20) DEFAULT 'scheduled',
    -- 'pending', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'

    -- Notes
    agenda TEXT,
    scheduler_note TEXT,
    attendee_note TEXT,
    meeting_summary TEXT,  -- Post-meeting summary

    -- Payment
    meeting_fee_paid BOOLEAN DEFAULT FALSE,
    payment_id UUID,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- Indexes for meetings
CREATE INDEX idx_meetings_project_id ON meetings (project_id);
CREATE INDEX idx_meetings_application_id ON meetings (application_id);
CREATE INDEX idx_meetings_scheduler_id ON meetings (scheduler_id);
CREATE INDEX idx_meetings_attendee_id ON meetings (attendee_id);
CREATE INDEX idx_meetings_scheduled_at ON meetings (scheduled_at);
CREATE INDEX idx_meetings_status ON meetings (status);

-- Trigger for meetings updated_at
CREATE TRIGGER update_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetings
CREATE POLICY "meetings_select_policy" ON meetings
    FOR SELECT USING (scheduler_id = auth.uid() OR attendee_id = auth.uid());

CREATE POLICY "meetings_insert_policy" ON meetings
    FOR INSERT WITH CHECK (scheduler_id = auth.uid());

CREATE POLICY "meetings_update_scheduler_policy" ON meetings
    FOR UPDATE USING (scheduler_id = auth.uid());

CREATE POLICY "meetings_update_attendee_policy" ON meetings
    FOR UPDATE USING (attendee_id = auth.uid());

CREATE POLICY "meetings_delete_policy" ON meetings
    FOR DELETE USING (scheduler_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 3.8 contracts - Legal contracts
-- ----------------------------------------------------------------------------
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(id),

    -- Parties
    party1_id UUID NOT NULL REFERENCES profiles(id),  -- Project owner
    party2_id UUID NOT NULL REFERENCES profiles(id),  -- Collaborator

    -- Contract type
    contract_type VARCHAR(50) DEFAULT 'collaboration',
    -- 'collaboration', 'nda', 'revenue_share', 'full_partnership'

    -- Contract terms
    terms JSONB NOT NULL,  -- Detailed contract terms
    /*
    {
        "equity": {"party1": 60, "party2": 40},
        "revenue": {"party1": 50, "party2": 50},
        "roles": {"party1": ["biz", "marketing"], "party2": ["dev", "design"]},
        "responsibilities": {"party1": ["Business operation", "Marketing"], "party2": ["Development", "Maintenance"]},
        "ip_ownership": "Joint ownership",
        "termination_clause": "..."
    }
    */

    -- Signatures
    party1_signed BOOLEAN DEFAULT FALSE,
    party1_signed_at TIMESTAMPTZ,
    party1_signature TEXT,  -- Signature image URL

    party2_signed BOOLEAN DEFAULT FALSE,
    party2_signed_at TIMESTAMPTZ,
    party2_signature TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'draft',
    -- 'draft', 'pending_signatures', 'active', 'expired', 'terminated'

    -- Document
    pdf_url TEXT,
    version INTEGER DEFAULT 1,

    -- Validity period
    effective_date DATE,
    expiry_date DATE,

    -- Payment
    contract_fee_paid BOOLEAN DEFAULT FALSE,
    payment_id UUID,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    signed_at TIMESTAMPTZ,  -- When both parties signed
    terminated_at TIMESTAMPTZ
);

-- Indexes for contracts
CREATE INDEX idx_contracts_project_id ON contracts (project_id);
CREATE INDEX idx_contracts_party1_id ON contracts (party1_id);
CREATE INDEX idx_contracts_party2_id ON contracts (party2_id);
CREATE INDEX idx_contracts_status ON contracts (status);
CREATE INDEX idx_contracts_meeting_id ON contracts (meeting_id);

-- Trigger for contracts updated_at
CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "contracts_select_policy" ON contracts
    FOR SELECT USING (party1_id = auth.uid() OR party2_id = auth.uid());

CREATE POLICY "contracts_insert_policy" ON contracts
    FOR INSERT WITH CHECK (party1_id = auth.uid() OR party2_id = auth.uid());

CREATE POLICY "contracts_update_policy" ON contracts
    FOR UPDATE USING (party1_id = auth.uid() OR party2_id = auth.uid());

-- No delete policy - contracts should not be deleted

-- ----------------------------------------------------------------------------
-- 3.9 payments - Payment transactions
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Related entities
    project_id UUID REFERENCES projects(id),
    meeting_id UUID REFERENCES meetings(id),
    contract_id UUID REFERENCES contracts(id),

    -- Payment type
    payment_type VARCHAR(50) NOT NULL,
    -- 'project_upload', 'meeting_fee', 'contract_fee', 'subscription'

    -- Amount
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',

    -- Stripe information
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),

    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'

    -- Details
    description TEXT,
    metadata JSONB,
    receipt_url TEXT,

    -- Refund information
    refunded_amount DECIMAL(12, 2) DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ
);

-- Indexes for payments
CREATE INDEX idx_payments_user_id ON payments (user_id);
CREATE INDEX idx_payments_project_id ON payments (project_id);
CREATE INDEX idx_payments_meeting_id ON payments (meeting_id);
CREATE INDEX idx_payments_contract_id ON payments (contract_id);
CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payments_payment_type ON payments (payment_type);
CREATE INDEX idx_payments_stripe_intent ON payments (stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments (created_at DESC);

-- Trigger for payments updated_at
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "payments_select_policy" ON payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "payments_insert_policy" ON payments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- No update/delete policies - payments should be immutable

-- ============================================================================
-- SECTION 4: COMMUNICATION TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 chat_rooms - Chat rooms
-- ----------------------------------------------------------------------------
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Related project
    project_id UUID REFERENCES projects(id),

    -- Chat room type
    room_type VARCHAR(20) DEFAULT 'direct',  -- 'direct', 'group', 'project'

    -- Metadata
    name VARCHAR(100),
    last_message_at TIMESTAMPTZ,
    last_message_preview TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chat_rooms
CREATE INDEX idx_chat_rooms_project_id ON chat_rooms (project_id);
CREATE INDEX idx_chat_rooms_room_type ON chat_rooms (room_type);
CREATE INDEX idx_chat_rooms_last_message_at ON chat_rooms (last_message_at DESC);

-- Trigger for chat_rooms updated_at
CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for chat_rooms
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4.2 chat_participants - Room participants
-- ----------------------------------------------------------------------------
CREATE TABLE chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Participant info
    role VARCHAR(20) DEFAULT 'member',  -- 'admin', 'member'

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_read_at TIMESTAMPTZ,
    unread_count INTEGER DEFAULT 0,

    -- Notifications
    notifications_enabled BOOLEAN DEFAULT TRUE,

    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,

    UNIQUE(room_id, user_id)
);

-- Indexes for chat_participants
CREATE INDEX idx_chat_participants_room_id ON chat_participants (room_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants (user_id);
CREATE INDEX idx_chat_participants_is_active ON chat_participants (is_active);

-- Enable RLS for chat_participants
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms (depends on chat_participants)
CREATE POLICY "chat_rooms_select_policy" ON chat_rooms
    FOR SELECT USING (
        id IN (
            SELECT room_id FROM chat_participants
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "chat_rooms_insert_policy" ON chat_rooms
    FOR INSERT WITH CHECK (true);

CREATE POLICY "chat_rooms_update_policy" ON chat_rooms
    FOR UPDATE USING (
        id IN (
            SELECT room_id FROM chat_participants
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for chat_participants
CREATE POLICY "chat_participants_select_policy" ON chat_participants
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM chat_participants
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "chat_participants_insert_policy" ON chat_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_participants_update_policy" ON chat_participants
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "chat_participants_delete_policy" ON chat_participants
    FOR DELETE USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4.3 messages - Chat messages
-- ----------------------------------------------------------------------------
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),

    -- Message content
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',  -- 'text', 'image', 'file', 'system'

    -- Attachments
    attachments JSONB,  -- [{url, name, type, size}]

    -- Status
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ
);

-- Indexes for messages
CREATE INDEX idx_messages_room_id ON messages (room_id);
CREATE INDEX idx_messages_sender_id ON messages (sender_id);
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX idx_messages_message_type ON messages (message_type);

-- Trigger for messages updated_at
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "messages_select_policy" ON messages
    FOR SELECT USING (
        room_id IN (
            SELECT room_id FROM chat_participants
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "messages_insert_policy" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        room_id IN (
            SELECT room_id FROM chat_participants
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "messages_update_policy" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "messages_delete_policy" ON messages
    FOR DELETE USING (sender_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4.4 notifications - User notifications
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Notification type
    type VARCHAR(50) NOT NULL,
    -- 'application_received', 'application_accepted', 'application_rejected',
    -- 'meeting_scheduled', 'meeting_reminder', 'contract_ready', 'payment_received'

    -- Content
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,

    -- Related data
    reference_type VARCHAR(50),  -- 'project', 'application', 'meeting', 'contract'
    reference_id UUID,

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Action
    action_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX idx_notifications_type ON notifications (type);
CREATE INDEX idx_notifications_reference ON notifications (reference_type, reference_id);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "notifications_select_policy" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_policy" ON notifications
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_update_policy" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_policy" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 5: AUXILIARY TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 bookmarks - Project bookmarks
-- ----------------------------------------------------------------------------
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    note TEXT,  -- Personal note

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, project_id)
);

-- Indexes for bookmarks
CREATE INDEX idx_bookmarks_user_id ON bookmarks (user_id);
CREATE INDEX idx_bookmarks_project_id ON bookmarks (project_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks (created_at DESC);

-- Enable RLS for bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookmarks
CREATE POLICY "bookmarks_select_policy" ON bookmarks
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "bookmarks_insert_policy" ON bookmarks
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "bookmarks_update_policy" ON bookmarks
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "bookmarks_delete_policy" ON bookmarks
    FOR DELETE USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.2 reviews - User reviews
-- ----------------------------------------------------------------------------
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Review target
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    reviewee_id UUID NOT NULL REFERENCES profiles(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    contract_id UUID REFERENCES contracts(id),

    -- Ratings (1-5)
    overall_rating DECIMAL(2, 1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    communication_rating DECIMAL(2, 1) CHECK (communication_rating >= 1 AND communication_rating <= 5),
    expertise_rating DECIMAL(2, 1) CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
    reliability_rating DECIMAL(2, 1) CHECK (reliability_rating >= 1 AND reliability_rating <= 5),

    -- Review content
    comment TEXT,
    pros TEXT,  -- Advantages
    cons TEXT,  -- Areas for improvement

    -- Status
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,  -- Actual collaboration verified

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One review per project
    UNIQUE(reviewer_id, reviewee_id, project_id)
);

-- Indexes for reviews
CREATE INDEX idx_reviews_reviewer_id ON reviews (reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews (reviewee_id);
CREATE INDEX idx_reviews_project_id ON reviews (project_id);
CREATE INDEX idx_reviews_rating ON reviews (overall_rating DESC);
CREATE INDEX idx_reviews_created_at ON reviews (created_at DESC);

-- Trigger for reviews updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "reviews_select_policy" ON reviews
    FOR SELECT USING (is_public = true OR reviewer_id = auth.uid() OR reviewee_id = auth.uid());

CREATE POLICY "reviews_insert_policy" ON reviews
    FOR INSERT WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "reviews_update_policy" ON reviews
    FOR UPDATE USING (reviewer_id = auth.uid());

CREATE POLICY "reviews_delete_policy" ON reviews
    FOR DELETE USING (reviewer_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.3 reports - User/content reports
-- ----------------------------------------------------------------------------
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Report target
    report_type VARCHAR(50) NOT NULL,  -- 'user', 'project', 'message', 'review'
    target_id UUID NOT NULL,

    -- Report details
    reason VARCHAR(100) NOT NULL,
    -- 'spam', 'harassment', 'inappropriate', 'scam', 'copyright', 'other'
    description TEXT,
    evidence_urls TEXT[],

    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'reviewing', 'resolved', 'dismissed'

    -- Admin response
    admin_note TEXT,
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for reports
CREATE INDEX idx_reports_reporter_id ON reports (reporter_id);
CREATE INDEX idx_reports_report_type ON reports (report_type);
CREATE INDEX idx_reports_target_id ON reports (target_id);
CREATE INDEX idx_reports_status ON reports (status);
CREATE INDEX idx_reports_created_at ON reports (created_at DESC);

-- Trigger for reports updated_at
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "reports_select_policy" ON reports
    FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "reports_insert_policy" ON reports
    FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- No update/delete for users - only admins can manage reports

-- ----------------------------------------------------------------------------
-- 5.4 project_skills - Project skill requirements
-- ----------------------------------------------------------------------------
CREATE TABLE project_skills (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (project_id, skill_id)
);

-- Indexes for project_skills
CREATE INDEX idx_project_skills_project_id ON project_skills (project_id);
CREATE INDEX idx_project_skills_skill_id ON project_skills (skill_id);

-- Enable RLS for project_skills
ALTER TABLE project_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_skills
CREATE POLICY "project_skills_select_policy" ON project_skills
    FOR SELECT USING (true);

CREATE POLICY "project_skills_insert_policy" ON project_skills
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "project_skills_update_policy" ON project_skills
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "project_skills_delete_policy" ON project_skills
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
        )
    );

-- ============================================================================
-- SECTION 6: TRIGGERS FOR BUSINESS LOGIC
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6.1 Auto-create profile on user signup
-- ----------------------------------------------------------------------------
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ----------------------------------------------------------------------------
-- 6.2 Update project application count
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_project_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE projects
        SET application_count = application_count + 1,
            current_applicants = current_applicants + 1
        WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE projects
        SET application_count = GREATEST(application_count - 1, 0),
            current_applicants = GREATEST(current_applicants - 1, 0)
        WHERE id = OLD.project_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_application_change
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_project_application_count();

-- ----------------------------------------------------------------------------
-- 6.3 Update project bookmark count
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_project_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE projects
        SET bookmark_count = bookmark_count + 1
        WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE projects
        SET bookmark_count = GREATEST(bookmark_count - 1, 0)
        WHERE id = OLD.project_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_bookmark_change
    AFTER INSERT OR DELETE ON bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_bookmark_count();

-- ----------------------------------------------------------------------------
-- 6.4 Update user rating on review
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET
        rating = (
            SELECT COALESCE(AVG(overall_rating), 0)
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE reviewee_id = NEW.reviewee_id
        )
    WHERE id = NEW.reviewee_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_user_rating();

-- ----------------------------------------------------------------------------
-- 6.5 Notify on application status change
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_on_application()
RETURNS TRIGGER AS $$
DECLARE
    project_owner_id UUID;
    project_title VARCHAR(200);
BEGIN
    -- Get project info
    SELECT owner_id, title INTO project_owner_id, project_title
    FROM projects WHERE id = NEW.project_id;

    -- New application notification
    IF TG_OP = 'INSERT' THEN
        INSERT INTO notifications (user_id, type, title, content, reference_type, reference_id, action_url)
        VALUES (
            project_owner_id,
            'application_received',
            '새로운 지원자',
            project_title || ' 프로젝트에 새로운 지원이 있습니다.',
            'application',
            NEW.id,
            '/projects/' || NEW.project_id || '/applications'
        );
    -- Application accepted notification
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        INSERT INTO notifications (user_id, type, title, content, reference_type, reference_id, action_url)
        VALUES (
            NEW.applicant_id,
            'application_accepted',
            '지원 수락',
            project_title || ' 프로젝트 지원이 수락되었습니다!',
            'application',
            NEW.id,
            '/my/applications'
        );
    -- Application rejected notification
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        INSERT INTO notifications (user_id, type, title, content, reference_type, reference_id, action_url)
        VALUES (
            NEW.applicant_id,
            'application_rejected',
            '지원 결과',
            project_title || ' 프로젝트 지원이 반려되었습니다.',
            'application',
            NEW.id,
            '/my/applications'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_application_status_change
    AFTER INSERT OR UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_application();

-- ----------------------------------------------------------------------------
-- 6.6 Notify on meeting scheduled
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_on_meeting()
RETURNS TRIGGER AS $$
DECLARE
    scheduler_name VARCHAR(100);
    project_title VARCHAR(200);
BEGIN
    -- Get scheduler name and project title
    SELECT p.name INTO scheduler_name FROM profiles p WHERE p.id = NEW.scheduler_id;
    SELECT pr.title INTO project_title FROM projects pr WHERE pr.id = NEW.project_id;

    -- New meeting notification
    IF TG_OP = 'INSERT' THEN
        INSERT INTO notifications (user_id, type, title, content, reference_type, reference_id, action_url)
        VALUES (
            NEW.attendee_id,
            'meeting_scheduled',
            '미팅 예약',
            scheduler_name || '님이 ' || project_title || ' 프로젝트 관련 미팅을 예약했습니다.',
            'meeting',
            NEW.id,
            '/meetings/' || NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_meeting_created
    AFTER INSERT ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_meeting();

-- ----------------------------------------------------------------------------
-- 6.7 Update chat room last message
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_rooms
    SET
        last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100)
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_created
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_room_last_message();

-- ============================================================================
-- SECTION 7: VIEWS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1 Project details view
-- ----------------------------------------------------------------------------
CREATE VIEW project_details AS
SELECT
    p.*,
    pr.name as owner_name,
    pr.avatar_url as owner_avatar,
    pr.rating as owner_rating,
    pr.review_count as owner_review_count,
    pr.is_verified as owner_is_verified,
    (SELECT COUNT(*) FROM applications WHERE project_id = p.id AND status = 'pending') as pending_applications,
    (SELECT COUNT(*) FROM applications WHERE project_id = p.id AND status = 'accepted') as accepted_applications
FROM projects p
LEFT JOIN profiles pr ON p.owner_id = pr.id;

-- ----------------------------------------------------------------------------
-- 7.2 Application details view
-- ----------------------------------------------------------------------------
CREATE VIEW application_details AS
SELECT
    a.*,
    p.name as applicant_name,
    p.avatar_url as applicant_avatar,
    p.roles as applicant_roles,
    p.rating as applicant_rating,
    p.experience_years,
    p.github_username,
    p.is_verified as applicant_is_verified,
    pr.title as project_title,
    pr.owner_id as project_owner_id
FROM applications a
LEFT JOIN profiles p ON a.applicant_id = p.id
LEFT JOIN projects pr ON a.project_id = pr.id;

-- ============================================================================
-- SECTION 8: SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 8.1 Skills seed data
-- ----------------------------------------------------------------------------
INSERT INTO skills (name, category) VALUES
-- Programming Languages
('JavaScript', 'language'),
('TypeScript', 'language'),
('Python', 'language'),
('Java', 'language'),
('Kotlin', 'language'),
('Swift', 'language'),
('Go', 'language'),
('Rust', 'language'),
('C++', 'language'),
('C#', 'language'),
('PHP', 'language'),
('Ruby', 'language'),

-- Frontend Frameworks
('React', 'framework'),
('Vue.js', 'framework'),
('Angular', 'framework'),
('Next.js', 'framework'),
('Svelte', 'framework'),
('Nuxt.js', 'framework'),

-- Backend Frameworks
('Node.js', 'framework'),
('Django', 'framework'),
('FastAPI', 'framework'),
('Spring Boot', 'framework'),
('Express', 'framework'),
('NestJS', 'framework'),
('Laravel', 'framework'),
('Ruby on Rails', 'framework'),

-- Mobile Development
('React Native', 'framework'),
('Flutter', 'framework'),
('iOS', 'framework'),
('Android', 'framework'),

-- Databases
('PostgreSQL', 'tool'),
('MySQL', 'tool'),
('MongoDB', 'tool'),
('Redis', 'tool'),
('SQLite', 'tool'),
('Firebase', 'tool'),

-- Cloud/DevOps
('AWS', 'tool'),
('GCP', 'tool'),
('Azure', 'tool'),
('Docker', 'tool'),
('Kubernetes', 'tool'),
('Terraform', 'tool'),
('CI/CD', 'tool'),

-- Design Tools
('Figma', 'tool'),
('Adobe XD', 'tool'),
('Sketch', 'tool'),
('Adobe Photoshop', 'tool'),
('Adobe Illustrator', 'tool'),

-- AI/ML
('TensorFlow', 'tool'),
('PyTorch', 'tool'),
('Machine Learning', 'tool'),
('Deep Learning', 'tool'),
('NLP', 'tool'),
('Computer Vision', 'tool'),

-- Soft Skills
('프로젝트 관리', 'soft_skill'),
('커뮤니케이션', 'soft_skill'),
('리더십', 'soft_skill'),
('마케팅', 'soft_skill'),
('영업', 'soft_skill'),
('기획', 'soft_skill'),
('UX 디자인', 'soft_skill'),
('데이터 분석', 'soft_skill'),
('비즈니스 개발', 'soft_skill'),
('팀 빌딩', 'soft_skill');

-- ============================================================================
-- SECTION 9: COMMENTS
-- ============================================================================

-- Add table comments
COMMENT ON TABLE profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE skills IS 'Skills and technologies master list';
COMMENT ON TABLE user_skills IS 'User-skill relationships with proficiency';
COMMENT ON TABLE portfolios IS 'User portfolio items and projects';
COMMENT ON TABLE projects IS 'Project listings for matching';
COMMENT ON TABLE applications IS 'Project applications from users';
COMMENT ON TABLE meetings IS 'Video/phone meetings between users';
COMMENT ON TABLE contracts IS 'Legal contracts between parties';
COMMENT ON TABLE payments IS 'Payment transactions';
COMMENT ON TABLE chat_rooms IS 'Chat rooms for messaging';
COMMENT ON TABLE chat_participants IS 'Chat room participants';
COMMENT ON TABLE messages IS 'Chat messages';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE bookmarks IS 'Project bookmarks by users';
COMMENT ON TABLE reviews IS 'User reviews and ratings';
COMMENT ON TABLE reports IS 'User and content reports';
COMMENT ON TABLE project_skills IS 'Project skill requirements';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
