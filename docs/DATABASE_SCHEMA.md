# MatchUp - 데이터베이스 스키마 설계

**버전**: 1.0
**최종 수정일**: 2025-01-18
**Database**: Supabase PostgreSQL

---

## 1. 개요

### 1.1. ERD 다이어그램 (핵심 테이블)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │  profiles   │       │ portfolios  │
│─────────────│       │─────────────│       │─────────────│
│ id (PK)     │◀──1:1─│ id (PK/FK)  │──1:N─▶│ id (PK)     │
│ email       │       │ user_id     │       │ user_id (FK)│
│ ...         │       │ name        │       │ title       │
└─────────────┘       │ roles       │       │ url         │
                      │ ...         │       └─────────────┘
                      └──────┬──────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
      │  projects   │ │applications │ │  meetings   │
      │─────────────│ │─────────────│ │─────────────│
      │ id (PK)     │ │ id (PK)     │ │ id (PK)     │
      │ owner_id(FK)│ │ project_id  │ │ project_id  │
      │ title       │ │ applicant_id│ │ scheduler_id│
      │ type        │ │ status      │ │ attendee_id │
      │ roles_needed│ │ ...         │ │ datetime    │
      │ equity_share│ └──────┬──────┘ └──────┬──────┘
      │ revenue_share         │              │
      └──────┬──────┘         │              │
             │                │              │
             │                │              │
             ▼                ▼              ▼
      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
      │  contracts  │ │  payments   │ │  messages   │
      │─────────────│ │─────────────│ │─────────────│
      │ id (PK)     │ │ id (PK)     │ │ id (PK)     │
      │ project_id  │ │ user_id(FK) │ │ room_id     │
      │ party1_id   │ │ project_id  │ │ sender_id   │
      │ party2_id   │ │ type        │ │ content     │
      │ terms       │ │ amount      │ │ created_at  │
      └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 2. 핵심 테이블 정의

### 2.1. profiles (사용자 프로필)

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,

    -- 역할 정보 (복수 선택 가능)
    roles TEXT[] NOT NULL DEFAULT '{}',  -- ['dev', 'biz', 'marketing', 'design']
    primary_role VARCHAR(20),  -- 주 역할

    -- 프로필 상세
    bio TEXT,
    company VARCHAR(100),
    position VARCHAR(100),
    experience_years INTEGER DEFAULT 0,

    -- 인증 정보
    is_verified BOOLEAN DEFAULT FALSE,
    github_username VARCHAR(100),
    github_verified BOOLEAN DEFAULT FALSE,
    linkedin_url TEXT,
    portfolio_url TEXT,

    -- 통계
    projects_completed INTEGER DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,

    -- 설정
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    privacy_settings JSONB DEFAULT '{"show_email": false, "show_phone": false}',

    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_profiles_roles ON profiles USING GIN (roles);
CREATE INDEX idx_profiles_primary_role ON profiles (primary_role);
CREATE INDEX idx_profiles_rating ON profiles (rating DESC);
CREATE INDEX idx_profiles_created_at ON profiles (created_at DESC);

-- RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### 2.2. portfolios (포트폴리오)

```sql
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),  -- 'project', 'certification', 'experience'

    -- 링크 및 미디어
    url TEXT,
    image_urls TEXT[],
    video_url TEXT,

    -- 메타데이터
    tech_stack TEXT[],
    start_date DATE,
    end_date DATE,
    is_ongoing BOOLEAN DEFAULT FALSE,

    -- 노출 설정
    is_public BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_portfolios_user_id ON portfolios (user_id);
CREATE INDEX idx_portfolios_category ON portfolios (category);

-- RLS 정책
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public portfolios are viewable"
ON portfolios FOR SELECT
USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own portfolios"
ON portfolios FOR ALL
USING (user_id = auth.uid());
```

### 2.3. projects (프로젝트)

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- 기본 정보
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),

    -- 프로젝트 분류
    project_type VARCHAR(20) NOT NULL,  -- 'idea', 'service'
    category VARCHAR(50),  -- 'app', 'web', 'ai', 'fintech', 'ecommerce', 'other'
    stage VARCHAR(20) DEFAULT 'idea',  -- 'idea', 'mvp', 'beta', 'launched'

    -- 상세 설명
    problem_statement TEXT,  -- 문제 정의
    solution TEXT,           -- 솔루션
    target_customer TEXT,    -- 타깃 고객
    market_size TEXT,        -- 시장 규모
    competitive_advantage TEXT,  -- 경쟁 우위

    -- 모집 역할 (복수 선택)
    roles_needed TEXT[] NOT NULL DEFAULT '{}',  -- ['dev', 'biz', 'marketing', 'design']

    -- 지분/수익 조건
    equity_distribution JSONB,  -- {"dev": 40, "biz": 40, "marketing": 10, "design": 10}
    revenue_distribution JSONB, -- {"dev": 30, "biz": 30, "marketing": 20, "design": 20}

    -- 추가 조건
    work_type VARCHAR(20) DEFAULT 'remote',  -- 'remote', 'onsite', 'hybrid'
    work_hours VARCHAR(50),      -- "주 10시간", "풀타임" 등
    expected_duration VARCHAR(50), -- "3개월", "6개월", "장기"

    -- 서비스 기반 프로젝트용
    demo_url TEXT,
    github_url TEXT,
    screenshots TEXT[],
    video_url TEXT,

    -- 상태 관리
    status VARCHAR(20) DEFAULT 'draft',  -- 'draft', 'active', 'paused', 'completed', 'closed'
    is_featured BOOLEAN DEFAULT FALSE,

    -- 모집 정보
    deadline TIMESTAMPTZ,
    max_applicants INTEGER DEFAULT 100,
    current_applicants INTEGER DEFAULT 0,

    -- 통계
    view_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,

    -- 결제 정보
    upload_fee_paid BOOLEAN DEFAULT FALSE,
    payment_id UUID,

    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_projects_owner_id ON projects (owner_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_project_type ON projects (project_type);
CREATE INDEX idx_projects_category ON projects (category);
CREATE INDEX idx_projects_roles_needed ON projects USING GIN (roles_needed);
CREATE INDEX idx_projects_created_at ON projects (created_at DESC);
CREATE INDEX idx_projects_deadline ON projects (deadline);
CREATE INDEX idx_projects_featured ON projects (is_featured) WHERE is_featured = true;

-- RLS 정책
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active projects are viewable by everyone"
ON projects FOR SELECT
USING (status = 'active' OR owner_id = auth.uid());

CREATE POLICY "Users can manage own projects"
ON projects FOR ALL
USING (owner_id = auth.uid());
```

### 2.4. applications (지원)

```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- 지원 역할 (최대 2개)
    applied_roles TEXT[] NOT NULL,  -- ['dev', 'marketing']

    -- 지원 내용
    cover_letter TEXT,
    appeal_points TEXT,
    expected_contribution TEXT,

    -- 조건 협상
    requested_equity DECIMAL(5, 2),
    requested_revenue_share DECIMAL(5, 2),

    -- 첨부 자료
    portfolio_ids UUID[],  -- 선택한 포트폴리오
    additional_files TEXT[],

    -- 상태
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'

    -- 결과 메모
    owner_note TEXT,  -- 게시자가 남기는 내부 메모
    rejection_reason TEXT,

    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    decided_at TIMESTAMPTZ,

    -- 유니크 제약
    UNIQUE(project_id, applicant_id)
);

-- 인덱스
CREATE INDEX idx_applications_project_id ON applications (project_id);
CREATE INDEX idx_applications_applicant_id ON applications (applicant_id);
CREATE INDEX idx_applications_status ON applications (status);
CREATE INDEX idx_applications_created_at ON applications (created_at DESC);

-- RLS 정책
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants can view own applications"
ON applications FOR SELECT
USING (applicant_id = auth.uid());

CREATE POLICY "Project owners can view applications"
ON applications FOR SELECT
USING (
    project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Users can create applications"
ON applications FOR INSERT
WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Applicants can withdraw applications"
ON applications FOR UPDATE
USING (applicant_id = auth.uid());

CREATE POLICY "Project owners can manage applications"
ON applications FOR UPDATE
USING (
    project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
    )
);
```

### 2.5. meetings (미팅)

```sql
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    -- 참가자
    scheduler_id UUID NOT NULL REFERENCES profiles(id),  -- 미팅 주관자
    attendee_id UUID NOT NULL REFERENCES profiles(id),   -- 미팅 참가자

    -- 일정
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',

    -- 미팅 방식
    meeting_type VARCHAR(20) DEFAULT 'video',  -- 'video', 'phone', 'chat', 'offline'
    meeting_url TEXT,  -- 화상 미팅 URL
    location TEXT,     -- 오프라인 장소

    -- 상태
    status VARCHAR(20) DEFAULT 'scheduled',
    -- 'pending', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'

    -- 메모
    agenda TEXT,
    scheduler_note TEXT,
    attendee_note TEXT,
    meeting_summary TEXT,  -- 미팅 후 요약

    -- 결제
    meeting_fee_paid BOOLEAN DEFAULT FALSE,
    payment_id UUID,

    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_meetings_project_id ON meetings (project_id);
CREATE INDEX idx_meetings_scheduler_id ON meetings (scheduler_id);
CREATE INDEX idx_meetings_attendee_id ON meetings (attendee_id);
CREATE INDEX idx_meetings_scheduled_at ON meetings (scheduled_at);
CREATE INDEX idx_meetings_status ON meetings (status);

-- RLS 정책
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meeting participants can view meetings"
ON meetings FOR SELECT
USING (scheduler_id = auth.uid() OR attendee_id = auth.uid());

CREATE POLICY "Schedulers can manage meetings"
ON meetings FOR ALL
USING (scheduler_id = auth.uid());

CREATE POLICY "Attendees can update meeting status"
ON meetings FOR UPDATE
USING (attendee_id = auth.uid());
```

### 2.6. contracts (계약서)

```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(id),

    -- 당사자
    party1_id UUID NOT NULL REFERENCES profiles(id),  -- 프로젝트 소유자
    party2_id UUID NOT NULL REFERENCES profiles(id),  -- 협력자

    -- 계약 유형
    contract_type VARCHAR(50) DEFAULT 'collaboration',
    -- 'collaboration', 'nda', 'revenue_share', 'full_partnership'

    -- 계약 조건
    terms JSONB NOT NULL,  -- 상세 계약 조건
    /*
    {
        "equity": {
            "party1": 60,
            "party2": 40
        },
        "revenue": {
            "party1": 50,
            "party2": 50
        },
        "roles": {
            "party1": ["biz", "marketing"],
            "party2": ["dev", "design"]
        },
        "responsibilities": {
            "party1": ["사업 운영", "마케팅"],
            "party2": ["개발", "유지보수"]
        },
        "ip_ownership": "공동 소유",
        "termination_clause": "..."
    }
    */

    -- 서명
    party1_signed BOOLEAN DEFAULT FALSE,
    party1_signed_at TIMESTAMPTZ,
    party1_signature TEXT,  -- 서명 이미지 URL

    party2_signed BOOLEAN DEFAULT FALSE,
    party2_signed_at TIMESTAMPTZ,
    party2_signature TEXT,

    -- 상태
    status VARCHAR(20) DEFAULT 'draft',
    -- 'draft', 'pending_signatures', 'active', 'expired', 'terminated'

    -- 문서
    pdf_url TEXT,
    version INTEGER DEFAULT 1,

    -- 유효 기간
    effective_date DATE,
    expiry_date DATE,

    -- 결제
    contract_fee_paid BOOLEAN DEFAULT FALSE,
    payment_id UUID,

    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    signed_at TIMESTAMPTZ,  -- 양측 서명 완료 시점
    terminated_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_contracts_project_id ON contracts (project_id);
CREATE INDEX idx_contracts_party1_id ON contracts (party1_id);
CREATE INDEX idx_contracts_party2_id ON contracts (party2_id);
CREATE INDEX idx_contracts_status ON contracts (status);

-- RLS 정책
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contract parties can view contracts"
ON contracts FOR SELECT
USING (party1_id = auth.uid() OR party2_id = auth.uid());

CREATE POLICY "Contract parties can sign"
ON contracts FOR UPDATE
USING (party1_id = auth.uid() OR party2_id = auth.uid());
```

### 2.7. payments (결제)

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- 연관 엔티티
    project_id UUID REFERENCES projects(id),
    meeting_id UUID REFERENCES meetings(id),
    contract_id UUID REFERENCES contracts(id),

    -- 결제 유형
    payment_type VARCHAR(50) NOT NULL,
    -- 'project_upload', 'meeting_fee', 'contract_fee', 'subscription'

    -- 금액
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',

    -- Stripe 정보
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),

    -- 상태
    status VARCHAR(20) DEFAULT 'pending',
    -- 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'

    -- 상세 정보
    description TEXT,
    metadata JSONB,
    receipt_url TEXT,

    -- 환불 정보
    refunded_amount DECIMAL(10, 2) DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMPTZ,

    -- 타임스탬프
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_payments_user_id ON payments (user_id);
CREATE INDEX idx_payments_project_id ON payments (project_id);
CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payments_payment_type ON payments (payment_type);
CREATE INDEX idx_payments_stripe_intent ON payments (stripe_payment_intent_id);

-- RLS 정책
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
ON payments FOR SELECT
USING (user_id = auth.uid());
```

---

## 3. 보조 테이블 정의

### 3.1. notifications (알림)

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- 알림 유형
    type VARCHAR(50) NOT NULL,
    -- 'application_received', 'application_accepted', 'application_rejected',
    -- 'meeting_scheduled', 'meeting_reminder', 'contract_ready', 'payment_received'

    -- 내용
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,

    -- 연관 데이터
    reference_type VARCHAR(50),  -- 'project', 'application', 'meeting', 'contract'
    reference_id UUID,

    -- 상태
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- 액션
    action_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);

-- RLS 정책
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications"
ON notifications FOR ALL
USING (user_id = auth.uid());
```

### 3.2. messages (채팅 메시지)

```sql
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 참가자
    participant_ids UUID[] NOT NULL,

    -- 연관 프로젝트
    project_id UUID REFERENCES projects(id),

    -- 채팅방 유형
    room_type VARCHAR(20) DEFAULT 'direct',  -- 'direct', 'group', 'project'

    -- 메타데이터
    name VARCHAR(100),
    last_message_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),

    -- 메시지 내용
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',  -- 'text', 'image', 'file', 'system'

    -- 첨부 파일
    attachments JSONB,  -- [{url, name, type, size}]

    -- 상태
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_chat_rooms_participants ON chat_rooms USING GIN (participant_ids);
CREATE INDEX idx_messages_room_id ON messages (room_id);
CREATE INDEX idx_messages_sender_id ON messages (sender_id);
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);

-- RLS 정책
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat room participants can view"
ON chat_rooms FOR SELECT
USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "Message senders and room participants can view"
ON messages FOR SELECT
USING (
    room_id IN (
        SELECT id FROM chat_rooms WHERE auth.uid() = ANY(participant_ids)
    )
);
```

### 3.3. reviews (리뷰/평점)

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 리뷰 대상
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    reviewee_id UUID NOT NULL REFERENCES profiles(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    contract_id UUID REFERENCES contracts(id),

    -- 평점 (1-5)
    overall_rating DECIMAL(2, 1) NOT NULL,
    communication_rating DECIMAL(2, 1),
    expertise_rating DECIMAL(2, 1),
    reliability_rating DECIMAL(2, 1),

    -- 리뷰 내용
    comment TEXT,
    pros TEXT,  -- 장점
    cons TEXT,  -- 개선점

    -- 상태
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,  -- 실제 협업 검증

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 한 프로젝트당 한 번만 리뷰
    UNIQUE(reviewer_id, reviewee_id, project_id)
);

-- 인덱스
CREATE INDEX idx_reviews_reviewee_id ON reviews (reviewee_id);
CREATE INDEX idx_reviews_project_id ON reviews (project_id);
CREATE INDEX idx_reviews_rating ON reviews (overall_rating DESC);

-- RLS 정책
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reviews are viewable"
ON reviews FOR SELECT
USING (is_public = true OR reviewer_id = auth.uid() OR reviewee_id = auth.uid());

CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (reviewer_id = auth.uid());
```

### 3.4. bookmarks (북마크)

```sql
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    note TEXT,  -- 개인 메모

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, project_id)
);

-- 인덱스
CREATE INDEX idx_bookmarks_user_id ON bookmarks (user_id);
CREATE INDEX idx_bookmarks_project_id ON bookmarks (project_id);

-- RLS 정책
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmarks"
ON bookmarks FOR ALL
USING (user_id = auth.uid());
```

### 3.5. skills (스킬 태그)

```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),  -- 'language', 'framework', 'tool', 'soft_skill'
    icon_url TEXT
);

CREATE TABLE user_skills (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER DEFAULT 3,  -- 1-5
    years_experience INTEGER,

    PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE project_skills (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (project_id, skill_id)
);
```

---

## 4. 트리거 및 함수

### 4.1. 자동 업데이트 트리거

```sql
-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 모든 테이블에 트리거 적용
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... 나머지 테이블도 동일하게 적용
```

### 4.2. 새 사용자 프로필 자동 생성

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at)
    VALUES (NEW.id, NEW.email, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4.3. 지원 카운트 업데이트

```sql
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
        SET application_count = application_count - 1,
            current_applicants = current_applicants - 1
        WHERE id = OLD.project_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_application_change
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_project_application_count();
```

### 4.4. 리뷰 평균 평점 업데이트

```sql
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET
        rating = (
            SELECT AVG(overall_rating)
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
    FOR EACH ROW EXECUTE FUNCTION update_user_rating();
```

### 4.5. 알림 생성 트리거

```sql
CREATE OR REPLACE FUNCTION notify_on_application()
RETURNS TRIGGER AS $$
DECLARE
    project_owner_id UUID;
    project_title VARCHAR(200);
BEGIN
    -- 프로젝트 정보 조회
    SELECT owner_id, title INTO project_owner_id, project_title
    FROM projects WHERE id = NEW.project_id;

    -- 새 지원 알림
    IF TG_OP = 'INSERT' THEN
        INSERT INTO notifications (user_id, type, title, content, reference_type, reference_id)
        VALUES (
            project_owner_id,
            'application_received',
            '새로운 지원자',
            project_title || ' 프로젝트에 새로운 지원이 있습니다.',
            'application',
            NEW.id
        );
    -- 지원 수락 알림
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        INSERT INTO notifications (user_id, type, title, content, reference_type, reference_id)
        VALUES (
            NEW.applicant_id,
            'application_accepted',
            '지원 수락',
            project_title || ' 프로젝트 지원이 수락되었습니다!',
            'application',
            NEW.id
        );
    -- 지원 거절 알림
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        INSERT INTO notifications (user_id, type, title, content, reference_type, reference_id)
        VALUES (
            NEW.applicant_id,
            'application_rejected',
            '지원 결과',
            project_title || ' 프로젝트 지원이 반려되었습니다.',
            'application',
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_application_status_change
    AFTER INSERT OR UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION notify_on_application();
```

---

## 5. 뷰 (Views)

### 5.1. 프로젝트 상세 뷰

```sql
CREATE VIEW project_details AS
SELECT
    p.*,
    pr.name as owner_name,
    pr.avatar_url as owner_avatar,
    pr.rating as owner_rating,
    pr.review_count as owner_review_count,
    (SELECT COUNT(*) FROM applications WHERE project_id = p.id AND status = 'pending') as pending_applications,
    (SELECT COUNT(*) FROM applications WHERE project_id = p.id AND status = 'accepted') as accepted_applications
FROM projects p
LEFT JOIN profiles pr ON p.owner_id = pr.id;
```

### 5.2. 지원자 상세 뷰

```sql
CREATE VIEW application_details AS
SELECT
    a.*,
    p.name as applicant_name,
    p.avatar_url as applicant_avatar,
    p.roles as applicant_roles,
    p.rating as applicant_rating,
    p.experience_years,
    p.github_username,
    pr.title as project_title
FROM applications a
LEFT JOIN profiles p ON a.applicant_id = p.id
LEFT JOIN projects pr ON a.project_id = pr.id;
```

---

## 6. 초기 데이터

### 6.1. 스킬 시드 데이터

```sql
INSERT INTO skills (name, category) VALUES
-- Languages
('JavaScript', 'language'),
('TypeScript', 'language'),
('Python', 'language'),
('Java', 'language'),
('Kotlin', 'language'),
('Swift', 'language'),
('Go', 'language'),
('Rust', 'language'),

-- Frontend
('React', 'framework'),
('Vue.js', 'framework'),
('Angular', 'framework'),
('Next.js', 'framework'),
('Svelte', 'framework'),

-- Backend
('Node.js', 'framework'),
('Django', 'framework'),
('FastAPI', 'framework'),
('Spring Boot', 'framework'),
('Express', 'framework'),

-- Mobile
('React Native', 'framework'),
('Flutter', 'framework'),
('iOS', 'framework'),
('Android', 'framework'),

-- Database
('PostgreSQL', 'tool'),
('MySQL', 'tool'),
('MongoDB', 'tool'),
('Redis', 'tool'),

-- Cloud/DevOps
('AWS', 'tool'),
('GCP', 'tool'),
('Docker', 'tool'),
('Kubernetes', 'tool'),

-- Design
('Figma', 'tool'),
('Adobe XD', 'tool'),
('Sketch', 'tool'),

-- Soft Skills
('프로젝트 관리', 'soft_skill'),
('커뮤니케이션', 'soft_skill'),
('리더십', 'soft_skill'),
('마케팅', 'soft_skill'),
('영업', 'soft_skill');
```

---

## 7. 마이그레이션 가이드

### 7.1. 초기 설정

```bash
# 1. Supabase CLI 설치
npm install -g supabase

# 2. 프로젝트 초기화
supabase init

# 3. 로컬 Supabase 시작
supabase start

# 4. 마이그레이션 생성
supabase migration new create_initial_schema

# 5. 마이그레이션 적용
supabase db reset
```

### 7.2. 마이그레이션 파일 구조

```
supabase/
├── migrations/
│   ├── 20250118000001_create_profiles.sql
│   ├── 20250118000002_create_portfolios.sql
│   ├── 20250118000003_create_projects.sql
│   ├── 20250118000004_create_applications.sql
│   ├── 20250118000005_create_meetings.sql
│   ├── 20250118000006_create_contracts.sql
│   ├── 20250118000007_create_payments.sql
│   ├── 20250118000008_create_notifications.sql
│   ├── 20250118000009_create_messages.sql
│   ├── 20250118000010_create_reviews.sql
│   ├── 20250118000011_create_bookmarks.sql
│   ├── 20250118000012_create_skills.sql
│   ├── 20250118000013_create_triggers.sql
│   ├── 20250118000014_create_views.sql
│   └── 20250118000015_seed_data.sql
└── seed.sql
```

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*
