-- ==========================================
-- 마일리지 시스템 및 테스트 환경 개선
-- ==========================================

-- 1. profiles 테이블에 마일리지 컬럼 추가
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS mileage INTEGER DEFAULT 0;

-- 2. 마일리지 거래 내역 테이블
CREATE TABLE IF NOT EXISTS mileage_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'charge', 'use', 'refund'
    description TEXT,
    balance_after INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'project', 'application', etc.
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mileage_transactions_user_id ON mileage_transactions(user_id);

-- 3. 프로젝트 팀원 테이블
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    roles TEXT[] NOT NULL,
    equity_percentage DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'left'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- 4. 미팅 테이블 개선
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 5. RLS 정책 추가

-- mileage_transactions
ALTER TABLE mileage_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mileage transactions" ON mileage_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert mileage transactions" ON mileage_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- project_members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project members" ON project_members
    FOR SELECT USING (true);

CREATE POLICY "Project owner can manage members" ON project_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_members.project_id
            AND projects.owner_id = auth.uid()
        )
    );

-- 10. 마일리지 차감/충전 함수
CREATE OR REPLACE FUNCTION use_mileage(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- 현재 잔액 조회
    SELECT mileage INTO v_current_balance
    FROM profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- 잔액 부족 확인
    IF v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;

    -- 차감
    v_new_balance := v_current_balance - p_amount;

    UPDATE profiles
    SET mileage = v_new_balance
    WHERE id = p_user_id;

    -- 거래 내역 기록
    INSERT INTO mileage_transactions (user_id, amount, type, description, balance_after, reference_type, reference_id)
    VALUES (p_user_id, -p_amount, 'use', p_description, v_new_balance, p_reference_type, p_reference_id);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION charge_mileage(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- 현재 잔액 조회
    SELECT mileage INTO v_current_balance
    FROM profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- 충전
    v_new_balance := COALESCE(v_current_balance, 0) + p_amount;

    UPDATE profiles
    SET mileage = v_new_balance
    WHERE id = p_user_id;

    -- 거래 내역 기록
    INSERT INTO mileage_transactions (user_id, amount, type, description, balance_after)
    VALUES (p_user_id, p_amount, 'charge', p_description, v_new_balance);

    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 완료 메시지
SELECT '마일리지 시스템 및 테스트 환경 개선 완료!' as result;
