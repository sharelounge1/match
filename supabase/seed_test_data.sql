-- ==========================================
-- MatchUp 테스트 계정 및 샘플 데이터 생성
-- SQL Editor에서 실행하세요
-- ==========================================

-- 1. 테스트 사용자 생성 (Auth)
-- 비밀번호: Test1234!

-- 관리자 계정
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@matchup.test',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "관리자"}',
    false,
    'authenticated'
);

-- 일반 사용자 1 (개발자)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    'a0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'developer@matchup.test',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "김개발"}',
    false,
    'authenticated'
);

-- 일반 사용자 2 (기획자)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    'a0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'planner@matchup.test',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "이기획"}',
    false,
    'authenticated'
);

-- 일반 사용자 3 (디자이너)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    'a0000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'designer@matchup.test',
    crypt('Test1234!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "박디자인"}',
    false,
    'authenticated'
);

-- 2. 프로필 데이터 생성
-- (handle_new_user 트리거가 없는 경우 수동 생성)

INSERT INTO profiles (id, email, name, phone, roles, primary_role, bio, company, position, experience_years, is_verified, rating, review_count)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'admin@matchup.test',
    '관리자',
    '010-0000-0000',
    ARRAY['biz'],
    'biz',
    'MatchUp 서비스 관리자입니다.',
    'MatchUp',
    '관리자',
    10,
    true,
    5.0,
    0
),
(
    'a0000000-0000-0000-0000-000000000002',
    'developer@matchup.test',
    '김개발',
    '010-1234-5678',
    ARRAY['dev', 'design'],
    'dev',
    '5년차 풀스택 개발자입니다. React, Node.js, Python을 주로 사용합니다.',
    '테크스타트업',
    '시니어 개발자',
    5,
    true,
    4.8,
    12
),
(
    'a0000000-0000-0000-0000-000000000003',
    'planner@matchup.test',
    '이기획',
    '010-2345-6789',
    ARRAY['biz', 'marketing'],
    'biz',
    '스타트업 창업 경험이 있는 기획자입니다. 사용자 중심의 서비스 설계를 추구합니다.',
    '기획컨설팅',
    '대표',
    7,
    true,
    4.5,
    8
),
(
    'a0000000-0000-0000-0000-000000000004',
    'designer@matchup.test',
    '박디자인',
    '010-3456-7890',
    ARRAY['design'],
    'design',
    'UI/UX 디자이너입니다. Figma, Sketch를 주로 사용합니다.',
    '디자인스튜디오',
    '리드 디자이너',
    4,
    true,
    4.9,
    15
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    roles = EXCLUDED.roles,
    primary_role = EXCLUDED.primary_role,
    bio = EXCLUDED.bio;

-- 3. 샘플 프로젝트 생성

INSERT INTO projects (id, owner_id, title, description, short_description, project_type, category, stage, roles_needed, equity_distribution, revenue_distribution, status, deadline, view_count, bookmark_count)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000003',
    'AI 기반 운동 추천 앱',
    '개인의 체형, 목표, 생활패턴을 분석하여 맞춤형 운동 프로그램을 추천하는 AI 서비스입니다. 홈트레이닝 시장의 성장과 함께 개인화된 운동 솔루션에 대한 수요가 증가하고 있습니다.',
    '개인 맞춤형 운동 프로그램을 AI가 추천',
    'idea',
    'app',
    'idea',
    ARRAY['dev', 'design'],
    '{"dev": 40, "design": 20, "biz": 40}',
    '{"dev": 35, "design": 15, "biz": 50}',
    'active',
    NOW() + INTERVAL '30 days',
    156,
    23
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    '프리랜서 정산 자동화 플랫폼',
    '프리랜서의 수입 관리, 세금 계산, 세금 신고를 자동화하는 웹 서비스입니다. 복잡한 세금 계산을 간단하게 처리하고 신고 기한을 알려줍니다.',
    '프리랜서의 세금 신고와 정산 자동화',
    'idea',
    'web',
    'mvp',
    ARRAY['dev', 'marketing'],
    '{"dev": 45, "marketing": 15, "biz": 40}',
    '{"dev": 40, "marketing": 20, "biz": 40}',
    'active',
    NOW() + INTERVAL '45 days',
    89,
    15
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'AI 고객 응대 챗봇',
    '소상공인을 위한 24시간 AI 고객 응대 서비스입니다. 자주 묻는 질문에 자동 응답하고, 예약 및 주문을 처리합니다.',
    '소상공인을 위한 24시간 AI 응대',
    'service',
    'ai',
    'beta',
    ARRAY['biz', 'marketing'],
    '{"biz": 30, "marketing": 20, "dev": 50}',
    '{"biz": 35, "marketing": 25, "dev": 40}',
    'active',
    NOW() + INTERVAL '20 days',
    234,
    45
);

-- 4. 샘플 지원 생성

INSERT INTO applications (id, project_id, applicant_id, applied_roles, cover_letter, status, created_at)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    ARRAY['dev'],
    '안녕하세요, 5년차 풀스택 개발자 김개발입니다. AI 관련 프로젝트 경험이 있으며, React Native와 TensorFlow를 활용한 앱 개발이 가능합니다.',
    'pending',
    NOW() - INTERVAL '2 days'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000004',
    ARRAY['design'],
    '안녕하세요, UI/UX 디자이너 박디자인입니다. 헬스케어 앱 디자인 경험이 있습니다. 사용자 친화적인 인터페이스를 설계하겠습니다.',
    'shortlisted',
    NOW() - INTERVAL '3 days'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    ARRAY['biz', 'marketing'],
    '안녕하세요, 기획자 이기획입니다. B2B SaaS 마케팅 경험이 있으며, 소상공인 타겟 마케팅 전략을 수립할 수 있습니다.',
    'accepted',
    NOW() - INTERVAL '5 days'
);

-- 5. 샘플 북마크

INSERT INTO bookmarks (user_id, project_id)
VALUES
('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003'),
('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- 6. 샘플 알림

INSERT INTO notifications (id, user_id, type, title, content, action_url, is_read)
VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000003',
    'application_received',
    '새로운 지원자',
    '김개발님이 "AI 기반 운동 추천 앱" 프로젝트에 지원했습니다.',
    '/projects/b0000000-0000-0000-0000-000000000001/applicants',
    false
),
(
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'application_received',
    '새로운 지원자',
    '박디자인님이 "AI 기반 운동 추천 앱" 프로젝트에 지원했습니다.',
    '/projects/b0000000-0000-0000-0000-000000000001/applicants',
    false
),
(
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'application_accepted',
    '지원 결과',
    '"AI 고객 응대 챗봇" 프로젝트 지원이 수락되었습니다.',
    '/my-projects/applied',
    true
)
ON CONFLICT DO NOTHING;

-- 완료 메시지
SELECT '테스트 데이터 생성 완료!' as result;
